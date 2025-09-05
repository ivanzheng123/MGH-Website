import {EndpointScope} from "common/src/api/endpoints.ts";
import {Auth0ContextInterface, User} from "@auth0/auth0-react";
import {unrestrictedobject} from "common/src/unrestrictedobject.ts";

/**
 * Checks if the provided scope is authorized to view resources behind the requested scope.
 */
export const isAuthorized = (requested: EndpointScope, provided: EndpointScope) => {
    let scopes: string[] = [];
    switch (requested) {
        case "admin": {
            scopes = ["admin"];
            break;
        }
        case "employee": {
            scopes = ["admin", "employee"];
            break;
        }
        default: {
            scopes = [];
        }
    }
    return scopes.length === 0 || scopes.indexOf(provided) > -1;
};

/**
 * Returns a fetch `headers` object containing an authorization header containing a new Auth0 API bearer JWT.
 */
export const addTokenHeader = async (
    token: Awaited<ReturnType<Auth0ContextInterface<User>["getAccessTokenSilently"]>>
) => {
    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
};

/**
 * Returns a fetch `headers` object containing an authorization header containing a new Auth0 API bearer JWT. Also sets a JSON body based on the provided object.
 */
export const addTokenHeaderWithBody = async (
    token: Awaited<ReturnType<Auth0ContextInterface<User>["getAccessTokenSilently"]>>,
    body: unrestrictedobject
) => {
    return {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify(body),
    };
};
