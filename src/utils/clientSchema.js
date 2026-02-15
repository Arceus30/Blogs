import * as yup from "yup";

const imageFileSchema = yup
    .mixed()
    .test("fileSize", "File size must be less than 2MB", (value) => {
        if (!value || !value[0]) return true;
        return value[0].size <= 2 * 1024 * 1024;
    })
    .test("fileType", "Only PNG, JPG, WEBP, JPEG allowed", (value) => {
        if (!value || !value[0]) return true;
        return ["image/jpg", "image/jpeg", "image/webp", "image/png"].includes(
            value[0].type,
        );
    });

export const blogSchema = yup.object({
    title: yup
        .string()
        .trim()
        .required("Blog Title is required")
        .min(3, "Title must be at least 3 characters")
        .max(200, "Title cannot exceed 200 characters"),
    content: yup
        .string()
        .trim()
        .required("Content is required")
        .min(10, "Content Length should be at least 10 characters"),
    category: yup.string().required("Category is required"),
    bannerImage: imageFileSchema.optional().nullable(),
    tags: yup
        .string()
        .trim()
        .optional()
        .test(
            "tags-pattern",
            "Tags must be hashtags separated by spaces (e.g., #tag1 #tag2)",
            (value) => {
                if (!value) return true;
                const tagRegex = /^\s*(#[a-zA-Z0-9]+)(\s+(#[a-zA-Z0-9]+))*\s*$/;
                return tagRegex.test(value);
            },
        )
        .test(
            "no-empty-tags",
            "Tags cannot be empty or just spaces",
            (value) => {
                if (!value?.trim()) return true;
                const tags = value.trim().split(/\s+/).filter(Boolean);
                return (
                    tags.length > 0 && tags.every((tag) => tag.startsWith("#"))
                );
            },
        ),
});

export const categorySchema = yup.object({
    name: yup
        .string()
        .required("Category name is required")
        .trim()
        .min(3, "Category name should be at least 3 characters long")
        .max(50, "Category name too long"),
});

export const signUpSchema = yup.object({
    firstName: yup.string().trim().required("First name is required"),
    lastName: yup.string().trim().required("Last name is required"),
    email: yup
        .string()
        .trim()
        .email("Please enter a valid email")
        .required("Email is required"),
    profilePhoto: imageFileSchema.optional().nullable(),
    password: yup
        .string()
        .trim()
        .min(8, "Password must be at least 8 characters")
        .max(128, "Password too long")
        .matches(/[a-z]/, "Password must contain at least one lowercase letter")
        .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
        .matches(/[0-9]/, "Password must contain at least one number")
        .matches(
            /[^a-zA-Z0-9]/,
            "Password must contain at least one special character",
        )
        .required("Password is required"),
});

export const signInSchema = yup.object({
    email: yup
        .string()
        .trim()
        .email("Please enter a valid email")
        .required("Email is required"),
    password: yup.string().trim().required("Password is required"),
});

export const updateProfileSchema = yup.object({
    firstName: yup.string().trim().required("First name is required"),
    lastName: yup.string().trim().required("Last name is required"),
    email: yup
        .string()
        .email("Please enter a valid email")
        .trim()
        .required("Email is required"),
    bio: yup.string().trim().max(50, "Bio must be 10 characters or less"),
});

export const passwordSchema = yup.object().shape({
    oldPassword: yup.string().required("Old password is required"),
    newPassword: yup
        .string()
        .trim()
        .required("Password is required")
        .min(8, "Password must be at least 8 characters")
        .max(128, "Password too long")
        .matches(/[a-z]/, "Password must contain at least one lowercase letter")
        .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
        .matches(/[0-9]/, "Password must contain at least one number")
        .matches(
            /[^a-zA-Z0-9]/,
            "Password must contain at least one special character",
        )
        .notOneOf(
            [yup.ref("oldPassword")],
            "Passwords must be different from any of the old passwords",
        ),
    confirmPassword: yup
        .string()
        .required("Please confirm your new password")
        .oneOf([yup.ref("newPassword")], "Passwords must match"),
});
