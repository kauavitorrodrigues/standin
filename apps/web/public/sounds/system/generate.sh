#!/usr/bin/env bash
# Remakes the system sound files of this folder: <name>/<name>.mp3, one folder
# per sound. Every sound is built from sine tones with an envelope and, for a
# click or a breath, a little seeded noise, so the files are made, not
# recorded. Needs ffmpeg with libmp3lame.
#
#   bash apps/web/public/sounds/system/generate.sh
#
# Needs ffmpeg 5.1 or newer (amix with normalize=0). The same script gives the
# same files on the same ffmpeg build, because the noise is seeded and the
# encoder runs in bitexact mode.
set -euo pipefail

OUT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Every sound is brought to the same loudness, measured as the RMS of the part
# that is not silent (the pauses of the ring do not count), so no sound is
# louder than another whatever its length, and the game only has to decide the
# volume. The peak stays under the limit.
TARGET_RMS_DB=-22
PEAK_LIMIT_DB=-3
RATE=44100

WORK_DIR="$(mktemp -d)"
trap 'rm -rf "$WORK_DIR"' EXIT

# One sound. The first argument is the name, the others are layers, one string
# each. A layer is either
#   tone  <Hz> <start ms> <length s> <level dB> <decay rate> <attack s>
#   noise <high-pass Hz> <low-pass Hz> <start ms> <length s> <level dB> <decay rate> <attack s>
# Its envelope is a linear attack, an exponential decay (a higher rate dies
# sooner, 0 holds the level) and a 20 ms release so a cut never clicks. PAD_TO,
# set in the environment of the call, ends the sound with silence up to that
# many seconds (0, the default, adds none).
render_sound() {
    local pad_to="${PAD_TO:-0}"
    local name="$1"
    shift
    local raw="$WORK_DIR/$name.wav"
    local inputs=() graph="" mix="" index=0 layer
    local kind a b c d e f g
    for layer in "$@"; do
        read -r kind a b c d e f g <<<"$layer"
        case "$kind" in
        tone)
            # a=Hz b=start c=length d=level e=decay f=attack
            inputs+=(-f lavfi -i "sine=f=${a}:r=${RATE}:d=${c}")
            graph="${graph}[${index}:a]aeval='val(0)*min(t/${f},1)*min((${c}-t)/0.02,1)*exp(-t*${e})',volume=${d}dB,adelay=${b}[l${index}];"
            ;;
        noise)
            # a=high b=low c=start d=length e=level f=decay g=attack
            inputs+=(-f lavfi -i "anoisesrc=d=${d}:c=white:r=${RATE}:a=0.9:seed=$((7919 * (index + 1)))")
            graph="${graph}[${index}:a]highpass=f=${a},lowpass=f=${b},aeval='val(0)*min(t/${g},1)*min((${d}-t)/0.02,1)*exp(-t*${f})',volume=${e}dB,adelay=${c}[l${index}];"
            ;;
        *)
            echo "unknown layer: $kind" >&2
            exit 1
            ;;
        esac
        mix="${mix}[l${index}]"
        index=$((index + 1))
    done
    graph="${graph}${mix}amix=inputs=${index}:normalize=0:duration=longest,apad=whole_dur=${pad_to}[out]"

    ffmpeg -hide_banner -loglevel error -y "${inputs[@]}" \
        -filter_complex "$graph" -map "[out]" -ac 1 -c:a pcm_f32le "$raw"

    # Peak of the sound, then the loudness of the part that is not silent:
    # whatever is 45 dB under the peak counts as silence, so the measure follows
    # the sound and does not change with the gain. The gain takes the loudness
    # to the target without the peak going over its limit.
    local rms peak gain gate
    peak="$(ffmpeg -hide_banner -nostats -i "$raw" -af volumedetect -f null - 2>&1 |
        sed -nE 's/.*max_volume: (-?[0-9.]+) dB.*/\1/p')"
    [[ -n "$peak" ]] || { echo "could not measure $name" >&2; exit 1; }
    gate="$(awk -v peak="$peak" 'BEGIN { printf "%.2f", peak - 45 }')"
    rms="$(ffmpeg -hide_banner -nostats -i "$raw" \
        -af "silenceremove=start_periods=1:start_threshold=${gate}dB:stop_periods=-1:stop_duration=0.05:stop_threshold=${gate}dB,volumedetect" \
        -f null - 2>&1 | sed -nE 's/.*mean_volume: (-?[0-9.]+) dB.*/\1/p')"
    [[ -n "$rms" ]] || { echo "could not measure $name" >&2; exit 1; }
    gain="$(awk -v rms_target="$TARGET_RMS_DB" -v rms="$rms" -v peak_limit="$PEAK_LIMIT_DB" -v peak="$peak" \
        'BEGIN { by_rms = rms_target - rms; by_peak = peak_limit - peak; printf "%.2f", (by_rms < by_peak ? by_rms : by_peak) }')"

    mkdir -p "$OUT_DIR/$name"
    ffmpeg -hide_banner -loglevel error -y -i "$raw" \
        -af "volume=${gain}dB" \
        -ac 1 -ar 22050 -c:a libmp3lame -b:a 48k \
        -fflags +bitexact -flags:a +bitexact \
        "$OUT_DIR/$name/$name.mp3"
    echo "wrote $name/$name.mp3"
}

# A soft chord (E5 and B5) that settles on a higher E, like a message arriving.
render_sound notification \
    "tone 659.25 0 0.9 -6 5 0.004" "tone 987.77 0 0.9 -9 5 0.004" \
    "tone 1318.51 150 1.0 -7 4.5 0.004" "tone 1975.53 150 0.6 -20 9 0.004"

# A single bright bell: G6 with two inharmonic partials that die faster.
render_sound ding \
    "tone 1567.98 0 1.3 -4 3.5 0.002" "tone 4186 0 0.5 -18 9 0.002" "tone 3135.96 0 0.7 -14 6 0.002"

# A telephone ring: two 0.4 s bursts of 440 and 480 Hz (the pair a phone line
# uses) with a pause between them, then silence up to 2 s so a loop keeps the
# cadence.
PAD_TO=2 render_sound ring \
    "tone 440 0 0.4 -6 0 0.01" "tone 480 0 0.4 -6 0 0.01" "tone 880 0 0.4 -24 0 0.01" \
    "tone 440 600 0.4 -6 0 0.01" "tone 480 600 0.4 -6 0 0.01" "tone 880 600 0.4 -24 0 0.01"

# Hand up: a rising fifth, C5 to G5. Hand down: a falling pair, softer and
# duller, with less of the upper partial.
render_sound hand-raise \
    "tone 523.25 0 0.28 -6 8 0.004" "tone 1046.5 0 0.28 -18 8 0.004" \
    "tone 783.99 110 0.4 -5 6 0.004" "tone 1567.98 110 0.4 -16 7 0.004"
render_sound hand-lower \
    "tone 698.46 0 0.26 -8 9 0.006" \
    "tone 466.16 110 0.4 -7 6 0.006" "tone 932.33 110 0.3 -24 9 0.006"

# Lock: a click and two low notes falling to a thud. Unlock: a lighter click
# and two notes rising, so the pair reads as the same latch moving back.
render_sound lock \
    "noise 2500 9000 0 0.04 -15 80 0.001" "tone 330 0 0.25 -6 14 0.002" \
    "noise 1200 5000 100 0.05 -13 70 0.001" "tone 196 100 0.4 -4 10 0.002" "tone 98 100 0.4 -10 10 0.002"
render_sound unlock \
    "noise 1200 5000 0 0.05 -17 70 0.001" "tone 196 0 0.25 -8 14 0.002" \
    "noise 2500 9000 100 0.04 -13 80 0.001" "tone 392 100 0.35 -5 11 0.002" "tone 784 100 0.2 -20 14 0.002"

# A wave: a short breath of air and three quick bell notes going up, with a
# quiet repeat of the last one.
render_sound wave \
    "noise 700 3500 0 0.3 -26 4 0.08" \
    "tone 659.25 40 0.35 -7 9 0.004" "tone 830.61 130 0.35 -7 9 0.004" \
    "tone 987.77 220 0.5 -6 8 0.004" "tone 987.77 420 0.5 -14 8 0.004" "tone 1975.53 220 0.3 -22 12 0.004"

# Session start: a major arpeggio going up (C5 E5 G5 C6) that ends on a held,
# bright note.
render_sound session-start \
    "tone 523.25 0 0.4 -8 7 0.005" "tone 659.25 120 0.4 -8 7 0.005" \
    "tone 783.99 240 0.4 -8 7 0.005" "tone 1046.5 360 1.1 -6 3.5 0.005" "tone 2093 360 0.7 -20 6 0.005"

# Session end: the same shape falling (C6 G5 E5 C5), ending on a low note
# that rings out slower, so it feels like closing.
render_sound session-end \
    "tone 1046.5 0 0.4 -8 7 0.005" "tone 783.99 140 0.4 -8 7 0.005" \
    "tone 659.25 280 0.4 -8 7 0.005" "tone 523.25 420 1.4 -6 2.8 0.005" "tone 261.63 420 1.4 -12 2.8 0.005"
