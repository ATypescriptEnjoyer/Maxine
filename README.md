# Maxine - Discord Bot Assistant!!


[![Docker image](https://git.sashie.me/sasha/Maxine/actions/workflows/docker-image.yml/badge.svg)](https://git.sashie.me/sasha/Maxine/actions/workflows/docker-image.yml)

Maxine is a versatile Discord bot assistant designed to enhance your Discord server experience with a range of features, including support for ChatGPT 3.5-Turbo and DALLE 3, along with many other commands. Whether you need assistance, entertainment, or utility functions, Maxine has you covered.

## Features:

### 1. ChatGPT 3.5-Turbo Support:
Maxine leverages the power of OpenAI's ChatGPT 3.5-Turbo model to engage in conversations, answer questions, and provide intelligent responses.

### 2. DALLE 3 Support:
With DALLE support, Maxine can generate diverse and creative images based on text prompts, adding a visual dimension to your interactions.

### 3. Versatile Commands:
Maxine offers a variety of commands beyond AI interaction, including moderation tools, utility functions, and fun features to keep your server engaging.

### 5. Active Development:
Maxine is regularly updated with new features and improvements to ensure a seamless and enjoyable experience for users.

## Commands:

- **/8ball** `<message>`: Ask the 8 ball something you wish to know.
- **/ask** `<text prompt>`: Ask Maxine a question. Powered by ChatGPT 3.5-Turbo.
- **/avatar** `<user?>`: Retrieve a users avatar, or your own!
- **/cat**: Displays a picture of a randomly selected cat.
- **/convert**: Converts an unplayable webm/non h264 video to h264 so everyone can view!
- **/crop** `<image>`: Crops black bars from images
- **/dog**: Retrieve a picture of a random dog!
- **/draw** `<prompt>`:  Generate images based on text prompts using DALLE 3.
- **/reddit** `<subreddit name> <interval (hours)>`: Polls a subreddit on interval for content and posts to your channel automatically.
- **/resize** `<image> <xTimes>`: Resizes an image by X amount. eg: 2 doubles image size, -2 halves image size.
- **/rizz** `<user>`: Silly command that posts stupid "Rizz" to a user. Very silly.
- **/save** `<url> <clip_start?> <clip_end?>`: Downloads and optionally clips a video, then posts the response.
- **/time** `<location>`: Tells the time for the provided area.
- **/urban** `<word/phrase>`: Urban dictionaries the word/phrase and posts the top response.
- **/warn** `<user>`: Another silly "warning" command. Doesn't actually do anything. Requires role above Maxines to use.

## Apps:

- **tldrify**: TLDR's the selected message using ChatGPT 3.5-Turbo
- **translate**: Translates selected text. Powered by DeepL.

## Getting Started:

Maxine is dockerised. Just view [here](docker-compose.example.yml) for the example docker compose file.

## Feedback and Support:

Have questions, suggestions, or need assistance? Submit an issue and I'll try assist!
.
## Contributing:

Contributions to Maxine are welcome! Whether it's fixing bugs, adding new features, or improving documentation, your contributions help make Maxine better for everyone.

## License:

Maxine is released under the [MIT License](LICENSE). Feel free to use, modify, and distribute it according to your needs.
