# Footsteps

The sounds of walking: four takes for each floor material (carpet, wood, stone, grass), named `<material>-NN.mp3`. They are small mono mp3 files of 0.12 to 0.2 seconds.

They are generated, not recorded: each take is a burst of filtered noise with its own seed. [`generate.sh`](generate.sh) remakes all of them and needs ffmpeg with libmp3lame:

```sh
bash apps/web/public/sounds/footsteps/generate.sh
```

The files are licensed under [CC BY 4.0](LICENSE). Pull requests must not add or change audio, see [CONTRIBUTING.md](../../../../../CONTRIBUTING.md).
