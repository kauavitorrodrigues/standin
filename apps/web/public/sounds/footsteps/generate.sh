#!/usr/bin/env bash
# Remakes the footstep files of this folder: <material>/<material>-NN.mp3, a
# few takes per floor material. Every take is a short burst of filtered noise
# with its own seed, so the files are made, not recorded. Needs ffmpeg with
# libmp3lame.
#
#   bash apps/web/public/sounds/footsteps/generate.sh
#
# The same script gives the same files on the same ffmpeg build, because the
# noise is seeded and the encoder runs in bitexact mode.
set -euo pipefail

OUT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TAKES=17
# Every take is brought to the same loudness, measured as the RMS of its first
# 60 ms (where the step is), so a take is never louder than another whatever
# its color or length, and the game only has to decide the volume. The peak
# stays under the limit.
TARGET_RMS_DB=-51
PEAK_LIMIT_DB=-30

WORK_DIR="$(mktemp -d)"
trap 'rm -rf "$WORK_DIR"' EXIT

# One step. Arguments: material, take (1-based), noise color, high-pass Hz,
# low-pass Hz, length in seconds, decay rate of the envelope (higher is
# shorter and drier), attack in seconds, seed base. Optional, for a layer of
# air over the body (a thud alone sounds dry): high-pass Hz, low-pass Hz, level
# under the body in dB and decay rate of that layer. Then, for a hollow body, a
# tone: frequency in Hz, level in dB and decay rate. Last, a "room" (1 to turn
# it on): two quiet echoes a few tens of ms apart, which is what a dry burst of
# noise lacks.
render_take() {
    local material="$1" take="$2" color="$3" high="$4" low="$5"
    local length="$6" decay="$7" attack="$8" seed_base="$9"
    local air_high="${10:-}" air_low="${11:-}" air_db="${12:-}" air_decay="${13:-}"
    local tone_hz="${14:-}" tone_db="${15:-}" tone_decay="${16:-}" room="${17:-}"
    local seed=$((seed_base + take * 7919))

    # The filters move a little from take to take, from -16% to +16%, so the
    # pitch of the takes is spread evenly and no two takes sound alike.
    local shift=$((take * 2 - 18))
    local take_high=$((high * (100 + shift) / 100))
    local take_low=$((low * (100 - shift) / 100))
    local name
    name="$(printf '%s-%02d' "$material" "$take")"
    local raw="$WORK_DIR/$name.wav"
    mkdir -p "$OUT_DIR/$material"

    local body="[0:a]highpass=f=${take_high},lowpass=f=${take_low},aeval='val(0)*min(t/${attack},1)*exp(-t*${decay})'[body]"
    local graph="$body" mix="[body]" inputs=1
    if [[ -n "$air_high" ]]; then
        graph="${graph};[1:a]highpass=f=${air_high},lowpass=f=${air_low},aeval='val(0)*min(t/${attack},1)*exp(-t*${air_decay})',volume=${air_db}dB[air]"
        mix="${mix}[air]"
        inputs=$((inputs + 1))
    fi
    if [[ -n "$tone_hz" ]]; then
        local take_tone=$((tone_hz * (100 + shift) / 100))
        graph="${graph};[2:a]aeval='val(0)*min(t/${attack},1)*exp(-t*${tone_decay})',volume=${tone_db}dB[tone]"
        mix="${mix}[tone]"
        inputs=$((inputs + 1))
    fi
    graph="${graph};${mix}amix=inputs=${inputs}:normalize=0[mixed]"
    if [[ -n "$room" ]]; then
        graph="${graph};[mixed]aecho=0.8:0.7:23|47:0.35|0.18[out]"
    fi
    [[ -n "$room" ]] || graph="${graph};[mixed]anull[out]"
    [[ -n "$tone_hz" ]] || take_tone=100

    ffmpeg -hide_banner -loglevel error -y \
        -f lavfi -i "anoisesrc=d=${length}:c=${color}:r=22050:a=0.9:seed=${seed}" \
        -f lavfi -i "anoisesrc=d=${length}:c=white:r=22050:a=0.9:seed=$((seed + 1))" \
        -f lavfi -i "sine=f=${take_tone}:r=22050:d=${length}" \
        -filter_complex "$graph" -map "[out]" \
        -c:a pcm_f32le "$raw"

    # Loudness and peak of the take, then the gain that takes the loudness to
    # the target without the peak going over its limit.
    local stats rms peak gain
    stats="$(ffmpeg -hide_banner -nostats -i "$raw" -af "atrim=0:0.06,volumedetect" -f null - 2>&1)"
    rms="$(sed -n 's/.*mean_volume: \(-\?[0-9.]*\) dB.*/\1/p' <<<"$stats")"
    peak="$(sed -n 's/.*max_volume: \(-\?[0-9.]*\) dB.*/\1/p' <<<"$stats")"
    gain="$(awk -v rms_target="$TARGET_RMS_DB" -v rms="$rms" -v peak_limit="$PEAK_LIMIT_DB" -v peak="$peak" \
        'BEGIN { by_rms = rms_target - rms; by_peak = peak_limit - peak; printf "%.2f", (by_rms < by_peak ? by_rms : by_peak) }')"

    ffmpeg -hide_banner -loglevel error -y -i "$raw" \
        -af "volume=${gain}dB" \
        -ac 1 -ar 22050 -c:a libmp3lame -b:a 48k \
        -fflags +bitexact -flags:a +bitexact \
        "$OUT_DIR/$material/$name.mp3"
    echo "wrote $material/$name.mp3"
}

for take in $(seq 1 "$TAKES"); do
    # A thud with a little fabric over it: brown noise cut near 300 Hz, instant
    # attack, fast decay, and a very quiet layer of air from 0.9 to 3.5 kHz.
    render_take carpet "$take" brown 60 320 0.23 55 0.004 100 900 3500 -36 30
    # A deep knock: brown noise and a tone near 110 Hz for the wood to ring,
    # with a layer of air from 0.6 to 6 kHz that carries the tail.
    render_take wood "$take" brown 40 330 0.36 110 0.004 200 600 6000 -39 16 110 -3 60
    # A hard tock: pink noise up to 1.3 kHz, a short ring near 450 Hz and a
    # little air from 1.5 to 5 kHz.
    render_take stone "$take" pink 60 1300 0.44 95 0.002 300 1500 5000 -23 45 450 -10 80
    # A soft thud with a crunch: brown noise cut near 280 Hz and air from 2.5
    # to 10.5 kHz that dies slower than the body.
    render_take grass "$take" brown 40 200 0.25 45 0.004 400 1200 9000 -40 14
done
