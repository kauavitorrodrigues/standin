import { countConnections } from "./countConnections";
import { deleteConnection } from "./deleteConnection";
import { deleteConnectionsOfIntegration } from "./deleteConnectionsOfIntegration";
import { deleteConnectionsOfMember } from "./deleteConnectionsOfMember";
import { deleteConnectionsOfOrganization } from "./deleteConnectionsOfOrganization";
import { deleteConnectionsOfUser } from "./deleteConnectionsOfUser";
import { deleteIntegration } from "./deleteIntegration";
import { deleteIntegrationsOfOrganization } from "./deleteIntegrationsOfOrganization";
import { findConnection } from "./findConnection";
import { findIntegration } from "./findIntegration";
import { listConnections } from "./listConnections";
import { listConnectedUserIds } from "./listConnectedUserIds";
import { updateRefreshToken } from "./updateRefreshToken";
import { upsertConnection } from "./upsertConnection";
import { upsertIntegration } from "./upsertIntegration";

// The two tables every provider shares: the app an organization brought and
// the connections of its people. A provider's service passes its own
// `provider` and `service`.
export const IntegrationRepository = {
    findIntegration,
    upsertIntegration,
    deleteIntegration,
    deleteIntegrationsOfOrganization,
    findConnection,
    listConnections,
    countConnections,
    upsertConnection,
    updateRefreshToken,
    listConnectedUserIds,
    deleteConnection,
    deleteConnectionsOfIntegration,
    deleteConnectionsOfOrganization,
    deleteConnectionsOfMember,
    deleteConnectionsOfUser,
};
