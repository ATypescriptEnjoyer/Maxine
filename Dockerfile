FROM oven/bun:alpine AS final
WORKDIR /usr/src/app

# Set environment variables
ENV YOUTUBE_DL_SKIP_DOWNLOAD=true \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    NICKNAME=Maxine

RUN apk add ffmpeg python3 --no-cache && \
    wget https://github.com/yt-dlp/yt-dlp-nightly-builds/releases/latest/download/yt-dlp -P /usr/bin/ && \
    chmod +x /usr/bin/yt-dlp

# Copy application code
COPY . .

# Install dependencies
RUN bun install

# Set volume and default command
VOLUME [ "/data" ]
CMD [ "bun", "run", "app.ts" ]
