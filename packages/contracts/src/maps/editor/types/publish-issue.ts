// One entry of the 422 body of `POST /maps/:mapId/publish`.
export type PublishIssue = {
    opIndex: number;
    code: string;
    path: string;
    message: string;
};
