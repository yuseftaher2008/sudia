import { Request, Response, NextFunction } from "express";
import { ZodType } from "zod";
import { BadRequest } from "../../lib/errors.js";

export const validate = (schema:ZodType) => (req:Request,_res:Response,next:NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success){
        const details = result.error.issues
            .map(issue => `${issue.path.join(".") || "body"}: ${issue.message}`)
            .join("; ");
        return next(BadRequest(details));
    };
    req.body = result.data;
    next();
};
