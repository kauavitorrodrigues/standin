# System sounds

The short sounds of the app itself, in a folder per sound, named `<name>/<name>.mp3`. They are small mono mp3 files (22.05 kHz, 48 kbps), and every one has the same loudness (the script aims at -22 dB RMS over the part that is not silent, with the peak under -3 dB; in the encoded files the RMS is between -22.3 and -22.7 dB and the peak under -4 dB), so the game alone decides the volume.

| Name            | Length | What it sounds like                                           |
| --------------- | ------ | ------------------------------------------------------------- |
| `notification`  | 1.2 s  | A soft chord that settles on a higher note                    |
| `ding`          | 1.3 s  | A single bright bell                                          |
| `ring`          | 2.0 s  | Two bursts of a telephone pair of tones, then silence to loop |
| `hand-raise`    | 0.5 s  | Two notes going up                                            |
| `hand-lower`    | 0.5 s  | Two softer, duller notes going down                           |
| `lock`          | 0.5 s  | A click and two low notes falling to a thud                   |
| `unlock`        | 0.45 s | A lighter click and two notes rising                          |
| `wave`          | 0.9 s  | A breath of air and three quick bell notes going up           |
| `session-start` | 1.5 s  | A major arpeggio going up that ends on a held note            |
| `session-end`   | 1.8 s  | The same shape going down, ending on a low note               |

They are generated, not recorded: each sound is a sum of sine tones with an envelope, plus a little seeded noise for the clicks and the breath. [`generate.sh`](generate.sh) remakes all of them and needs ffmpeg with libmp3lame:

```sh
bash apps/web/public/sounds/system/generate.sh
```

It needs ffmpeg 5.1 or newer (`amix` with `normalize=0`). The same script gives the same files on the same ffmpeg build, so running it twice gives identical hashes; the files in this folder were made with ffmpeg n9.0.2.

The files are licensed under [CC BY 4.0](LICENSE). Pull requests must not add or change audio, see [CONTRIBUTING.md](../../../../../CONTRIBUTING.md).
