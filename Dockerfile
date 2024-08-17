FROM oven/bun:latest AS final
WORKDIR /usr/src/app

# Set environment variables
ENV YOUTUBE_DL_SKIP_DOWNLOAD=true \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    NICKNAME=Maxine

RUN apt update && apt install python3 && \
    wget https://github.com/yt-dlp/yt-dlp-nightly-builds/releases/latest/download/yt-dlp -P /usr/bin/ && \
    chmod +x /usr/bin/yt-dlp && \
    wget https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-linux64-gpl.tar.xz && \
    tar -xvf ffmpeg-master-latest-linux64-gpl.tar.xz  && \
    mv ffmpeg-master-latest-linux64-gpl/bin/ffmpeg /usr/bin && \
    chmod +x /usr/bin/ffmpeg

# Copy application code
COPY . .

# Install dependencies
RUN bun install

# Set volume and default command
VOLUME [ "/data" ]
CMD [ "bun", "run", "app.ts" ]
