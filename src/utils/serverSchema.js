import Joi from "joi";

export const blogSchema = Joi.object({
    title: Joi.string().trim().min(3).max(200).required().messages({
        "string.base": "Title must be a string",
        "string.min": "Title must be at least 3 characters",
        "string.max": "Title cannot exceed 200 characters",
        "any.required": "Blog Title is required",
    }),
    content: Joi.string().trim().min(10).required().messages({
        "string.base": "Content must be a string",
        "string.min": "Content should be at least 10 characters",
        "any.required": "Content is required",
    }),
    category: Joi.string().required().messages({
        "string.base": "Category must be a string",
        "string.pattern.base": "Invalid category ID",
        "any.required": "Category is required",
    }),
    tags: Joi.string()
        .trim()
        .optional()
        .allow("")
        .custom((value, helpers) => {
            if (!value) return value;
            const tagRegex = /^\s*(#[a-zA-Z0-9]+)(\s+(#[a-zA-Z0-9]+))*\s*$/;
            if (!tagRegex.test(value)) {
                return helpers.error("any.invalid", {
                    message:
                        "Tags must be hashtags separated by spaces (e.g., #tag1 #tag2)",
                });
            }
            const tags = value.trim().split(/\s+/).filter(Boolean);
            if (
                tags.length === 0 ||
                !tags.every((tag) => tag.startsWith("#"))
            ) {
                return helpers.error("any.invalid", {
                    message: "Tags cannot be empty or just spaces",
                });
            }

            return value;
        })
        .messages({
            "any.custom": "{{#message}}",
        }),
});

export const categorySchema = Joi.object({
    name: Joi.string().trim().min(3).max(50).required().messages({
        "string.base": "Category must be a string",
        "string.min": "Category name should be at least 3 characters long",
        "string.max": "Category name too long",
        "any.required": "Category name is required",
    }),
});

export const signUpSchema = Joi.object({
    firstName: Joi.string().trim().min(1).max(50).required().messages({
        "any.required": "First name is required",
        "string.min": "First name must be at least 1 character long",
        "string.max": "First name is too long",
    }),
    lastName: Joi.string().trim().min(1).max(50).required().messages({
        "any.required": "Last name is required",
        "string.min": "Last name must be at least 1 character long",
        "string.max": "Last name is too long",
    }),
    email: Joi.string()
        .trim()
        .email({ tlds: { allow: false } })
        .required()
        .messages({
            "string.email": "Please enter a valid email",
            "any.required": "Email is required",
        }),
    password: Joi.string()
        .trim()
        .min(8)
        .max(128)
        .pattern(/[a-z]/)
        .pattern(/[A-Z]/)
        .pattern(/[0-9]/)
        .pattern(/[^a-zA-Z0-9]/)
        .required()
        .messages({
            "string.min": "Password must be at least 8 characters",
            "string.max": "Password too long",
            "string.pattern.base":
                "Password must contain uppercase, lowercase, number, and special character",
            "any.required": "Password is required",
        }),
});

export const signInSchema = Joi.object({
    email: Joi.string()
        .trim()
        .email({ tlds: { allow: false } })
        .required()
        .messages({
            "string.email": "Please enter a valid email",
            "any.required": "Email is required",
        }),
    password: Joi.string()
        .trim()
        .required()
        .messages({ "any.required": "Password is required" }),
});

export const updateProfileSchema = Joi.object({
    firstName: Joi.string().trim().required().messages({
        "any.required": "First name is required",
        "string.empty": "First name is required",
    }),
    lastName: Joi.string().trim().required().messages({
        "any.required": "Last name is required",
        "string.empty": "Last name is required",
    }),
    email: Joi.string()
        .trim()
        .email({ tlds: { allow: false } })
        .required()
        .messages({
            "string.email": "Please enter a valid email",
            "string.empty": "Email is required",
            "any.required": "Email is required",
        }),
    bio: Joi.string().trim().max(50).allow("").messages({
        "string.max": "Bio must be 50 characters or less",
        "string.empty": "Bio cannot be empty",
    }),
});

export const passwordSchema = Joi.object({
    oldPassword: Joi.string()
        .required()
        .messages({ "any.required": "Old password is required" }),
    newPassword: Joi.string()
        .trim()
        .required()
        .min(8)
        .max(128)
        .pattern(/[a-z]/)
        .pattern(/[A-Z]/)
        .pattern(/[0-9]/)
        .pattern(/[^a-zA-Z0-9]/)
        .disallow(Joi.ref("oldPassword"))
        .messages({
            "any.required": "Password is required",
            "string.min": "Password must be at least 8 characters",
            "string.max": "Password too long",
            "string.pattern.base":
                "Password must contain at least one lowercase letter",
            "string.pattern.base":
                "Password must contain at least one uppercase letter",
            "string.pattern.base": "Password must contain at least one number",
            "string.pattern.base":
                "Password must contain at least one special character",
            "any.disallow":
                "Passwords must be different from any of the old passwords",
        }),
    confirmPassword: Joi.string()
        .required()
        .valid(Joi.ref("newPassword"))
        .messages({
            "any.required": "Please confirm your new password",
            "any.only": "Passwords must match",
        }),
});
