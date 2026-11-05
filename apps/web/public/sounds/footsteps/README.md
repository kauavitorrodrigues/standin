# Footsteps

The sounds of walking: seventeen takes for each floor material, in a folder per material (`carpet/`, `wood/`, `stone/`, `grass/`), named `<material>-NN.mp3`. They are small mono mp3 files of 0.23 to 0.44 seconds, and every take has the same loudness (about -46 dB RMS over its first 60 ms), so the game alone decides the volume.

They are generated, not recorded: each take is a burst of filtered noise with its own seed, and the filters move a little from take to take. [`generate.sh`](generate.sh) remakes all of them and needs ffmpeg with libmp3lame:

```sh
bash apps/web/public/sounds/footsteps/generate.sh
```

The files are licensed under [CC BY 4.0](LICENSE). Pull requests must not add or change audio, see [CONTRIBUTING.md](../../../../../CONTRIBUTING.md).
