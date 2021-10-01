exports.getDate = function() {
    const d = new Date();
    const options = {
        weekday: "long",
        day: "numeric",
        month: "long"
    }
    return d.toLocaleDateString("en-US", options);
}