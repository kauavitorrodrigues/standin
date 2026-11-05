#!/usr/bin/env bash
# Remakes the footstep files of this folder: <material>-NN.mp3, a few takes per
# floor material. Every take is a short burst of filtered noise with its own
# seed, so the files are made, not recorded. Needs ffmpeg with libmp3lame.
#
#   bash apps/web/public/sounds/footsteps/generate.sh
#
# The same script gives the same files on the same ffmpeg build, because the
# noise is seeded and the encoder runs in bitexact mode.
set -euo pipefail

OUT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TAKES=4

# One step. Arguments: material, take (1-based), noise color, high-pass Hz,
# low-pass Hz, length in seconds, decay rate of the envelope (higher is
# shorter and drier), attack in seconds, seed base, gain in dB (filtered
# noise comes out at very different levels, so each material evens its own).
render_take() {
    local material="$1" take="$2" color="$3" high="$4" low="$5"
    local length="$6" decay="$7" attack="$8" seed_base="$9" gain="${10}"
    local seed=$((seed_base + take * 7919))

    # Each take shifts the filter a little, so no two takes sound alike.
    local shift=$((take * 6 - 15))
    local take_high=$((high * (100 + shift) / 100))
    local take_low=$((low * (100 - shift) / 100))
    local file
    file="$(printf '%s/%s-%02d.mp3' "$OUT_DIR" "$material" "$take")"

    ffmpeg -hide_banner -loglevel error -y \
        -f lavfi -i "anoisesrc=d=${length}:c=${color}:r=22050:a=0.9:seed=${seed}" \
        -af "highpass=f=${take_high},lowpass=f=${take_low},aeval='val(0)*min(t/${attack},1)*exp(-t*${decay})',volume=${gain}dB,alimiter=limit=0.9" \
        -ac 1 -ar 22050 -c:a libmp3lame -b:a 48k \
        -fflags +bitexact -flags:a +bitexact \
        "$file"
    echo "wrote $file"
}

for take in $(seq 1 "$TAKES"); do
    # Soft and dull: brown noise, low cut-off, slow attack.
    render_take carpet "$take" brown 80 900 0.20 22 0.020 100 9
    # A knock: pink noise around the low mids, quick attack.
    render_take wood "$take" pink 150 2200 0.15 30 0.004 200 9
    # Hard and bright: white noise, very quick attack, short tail.
    render_take stone "$take" white 700 6000 0.12 45 0.002 300 -2
    # Crunchy and airy: white noise with the lows cut, longer and softer.
    render_take grass "$take" white 1800 7500 0.20 18 0.012 400 -2
done
