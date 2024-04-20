interface ErrorObject {
    type: string;
    title: string;
    status: number;
    detail: string;
    solution: string;
    supported_sites?: string[];
    query?: string;
}

interface ErrorEnum {
    [key: string]: ErrorObject;
}

const ERRORS: ErrorEnum = {
    "HASH_NOT_FOUND": {
        "type": "HASH_NOT_FOUND",
        "title": "Hash not found",
        "status": 404,
        "detail": "The requested hash was not found in the database.",
        "solution": "Use /api/price/new?brand=...&size=...&shell=...&price=... to generate a new hash."
    },
    "MISSING_PARAMETER": {
        "type": "MISSING_PARAMETER",
        "title": "Missing parameter",
        "status": 400,
        "detail": "A parameter is missing",
        "solution": "Double check that you have `brand', `size', `shell' & `price' paramters"
    },
    "IMAGE_ERROR": {
        "type": "IMAGE_ERROR",
        "title": "Image error",
        "status": 500,
        "detail": "An error occurred while processing the image",
        "solution": "Check that the image is valid and try again"
    },
    "NO_IMAGE": {
        "type": "NO_IMAGE",
        "title": "No image",
        "status": 400,
        "detail": "No image was uploaded",
        "solution": "Upload an image and try again"
    },
    "ID_NOT_FOUND": {
        "type": "ID_NOT_FOUND",
        "title": "ID not found",
        "status": 404,
        "detail": "The requested ID was not found in the database",
        "solution": "Use /api/luggage/new/:hash to generate a new ID"
    },
};

export default ERRORS;
export {
    ERRORS,
    ErrorObject
};

