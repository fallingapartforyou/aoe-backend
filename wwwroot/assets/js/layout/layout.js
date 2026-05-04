function renderLayout(role) {

    const container = document.getElementById("layout");

    if (!container) return;

    const sidebar =
        role === "teacher"
        ? Sidebar.renderTeacher()
        : Sidebar.renderStudent();

    container.innerHTML = `
        ${sidebar}
    `;
}