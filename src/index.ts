import { readFile } from "fs/promises";
import http from "http";
import https from "https";

import * as Topgg from "@top-gg/sdk";
import express from "express";
import fetch from "node-fetch";

(async () => {
    try {
        const app = express();
        const topgg = new Topgg.Webhook(process.env.TOPGG_TOKEN);

        app.post(
            "/votes",
            topgg.listener(async (payload) => {
                const message = `Thankyou for voting Melon on top.gg` // update this later
                const reminder = `[ <@!${payload.user}> ]\n\n It is time for you to vote Melon on Top.gg` // update later with vote link and stuff

                await fetch(process.env.WEBHOOK_URL as string, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        content: message,
                        // eslint-disable-next-line camelcase
                        allowed_mentions: {
                            parse: ['USERS'],
                        },
                    }),
                });

                setTimeout(async () => {
                    await fetch(process.env.WEBHOOK_URL as string, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            content: reminder,
                        }),
                    });
                }, 1000 * 60 * 60 * 12); // 12 hours
            })
        );

        const httpServer = http.createServer(app);
        httpServer.listen(4080, () => {
            console.log("http server is live on port 4080");
        });

        if (process.env.NODE_ENV === "production") {
            const privateKey = await readFile(
                "/etc/letsencrypt/live/gaea.nhcarrigan.com/privkey.pem",
                "utf-8"
            );

            const certificate = await readFile(
                "/etc/letsencrypt/live/gaea.nhcarrigan.com/cert.pem",
                "utf-8"
            );

            const ca = await readFile(
                "/etc/letsencrypt/live/gaea.nhcarrigan.com/chain.pem",
                "utf-8"
            );

            const credentials = {
                key: privateKey,
                cert: certificate,
                ca: ca,
            };

            const httpsServer = https.createServer(credentials, app);
            httpsServer.listen(4443, () => {
                console.log("https server is live on port 4443!");
            });
        }
    } catch (err) {
        console.error(err);
    }
})();