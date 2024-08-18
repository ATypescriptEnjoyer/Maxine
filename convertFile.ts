import { downloadVideo } from "./downloader";
import tmp from "tmp";
import { unlink } from "node:fs/promises";

const BASE_ARGS = "-hwaccel cuda -c:v h264_nvenc -c:a aac";
const GIF_ARGS = "-vf fps=24,scale=320:-1:flags=lanczos -c:v gif";

const { NICKNAME } = process.env;


export const convertArguments = (ext: string): string => {
    return ext === "gif" ? GIF_ARGS : BASE_ARGS;
}

export const convertFile = async (url: string, ext: string, isLocalFile: boolean, extraFfmpegArgs: string = ''): Promise<{ exitCode: number, stdout?: string, file?: string }> => {
    const secondaryTempFile = tmp.tmpNameSync({
        prefix: NICKNAME,
        postfix: `.${ext}`
    });
    const filePath = isLocalFile ? url : await downloadVideo(url, false, false);
    const convertArgs = convertArguments(ext);
    const command = `ffmpeg -v error -i ${filePath} ${extraFfmpegArgs} ${convertArgs} ${secondaryTempFile}`;
    const { exited, stdout } = Bun.spawn(command.split(" "));
    const exitCode = await exited;
    if (exitCode !== 0) {
        const stdoutstr = await new Response(stdout).text();
        !isLocalFile && await unlink(filePath).catch();
        return {
            exitCode: exitCode,
            stdout: stdoutstr
        }
    }
    return {
        exitCode: exitCode,
        file: secondaryTempFile
    }
}