export const fullName = (firstName = "", lastName = "") => {
    return (
        firstName.charAt(0).toUpperCase() +
        firstName.slice(1) +
        " " +
        lastName.charAt(0).toUpperCase() +
        lastName.slice(1)
    );
};
