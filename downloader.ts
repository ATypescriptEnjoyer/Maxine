import tmp from "tmp";
import { Glob } from "bun";

const { NICKNAME } = process.env;

const rewriteUrl = (url: string): string => {
    if(url.includes("vxtwitter")) {
        return url.replace("vxtwitter.", "twitter.")
    }
    return url;
}

export const downloadVideo = async (url: string, showWarnings: boolean, isClip: boolean): Promise<string> => {
    const randomFileName = tmp.tmpNameSync({ prefix: NICKNAME });
    const { stdout, stderr, exited } = Bun.spawn({
        cmd: [
            `yt-dlp`,
            !showWarnings ? '--no-warnings' : '',
            "--add-header", "User-Agent:facebookexternalhit/1.1",
            "--no-check-certificate",
            "-f", 'bv*[ext=mp4][vcodec=h264]+ba[ext=m4a]/b[ext=mp4][vcodec=h264]/bv[vcodec=h264]+ba/bv+ba/b',
            ...(!isClip ? ['--max-filesize', '100m'] : []),
            `-o`, `${randomFileName}.%(ext)s`,
            "--merge-output-format", "mp4",
            rewriteUrl(url)
        ]
    });
    const exitCode = await exited;
    const stdoutstr = await new Response(stdout).text();
    const stderrstr = await new Response(stderr).text();
    if(exitCode > 0 && stderrstr) {
        throw new Error(stderrstr);
    }
    const glob = new Glob(`**/${randomFileName.substring(randomFileName.lastIndexOf("/") + 1)}.*`);
    const filePath = Array.from(glob.scanSync({ absolute: true, cwd: "/tmp" }))[0];
    if (!await Bun.file(filePath).exists()) {
        const fileTooLargeError = /File is larger than max-filesize/.exec(
            stdoutstr
        );
        if (fileTooLargeError) {
            throw new Error("Can't find a small enough file");
        }
        else {
            throw new Error("Unknown Error");
        }
    }
    return filePath;
}