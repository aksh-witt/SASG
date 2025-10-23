// side bar 

document.getElementById('open-btn').addEventListener('click', function() {
    document.getElementById('side-bar').classList.toggle('open-sidebar');
});


// 

document.addEventListener('DOMContentLoaded', () => {

    // ===============================================
    // PART 1: MODAL INTERFACE CONTROL
    // Responsible for opening, closing, and interacting with the modal.
    // ===============================================

    const modal = document.getElementById('managerModal');
    const openModalCard = document.getElementById('openModalCard');
    const closeButton = document.querySelector('.close-button');

    // Function to open the modal
    const openModal = () => {
        // The correct way to show an element with display: flex
        modal.style.display = 'flex';
    };

    // Function to close the modal
    const closeModal = () => {
        modal.style.display = 'none';
    };

    // Event: Click on the main card to open the modal
    openModalCard.addEventListener('click', openModal);

    // Event: Click on the 'X' to close the modal
    closeButton.addEventListener('click', closeModal);

    // Event: Click outside the content box to close the modal
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    // =================================================================
    // PART 2: ACTIONS LOGIC INSIDE THE MODAL (VISUAL/PLACEHOLDER)
    // Functions that handle the form, clicks, etc.
    // **THERE IS NO BACK-END LOGIC HERE.**
    // =================================================================

    const addClassForm = document.getElementById('addClassForm');
    const deleteButtons = document.querySelectorAll('.delete-btn');

    // Event: Handle the submission of the registration form
    addClassForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Prevents the page from reloading

        const className = document.getElementById('className').value;
        const classDescription = document.getElementById('classDescription').value;

        // For visual testing only: show data in the console
        console.log('Form submitted!');
        console.log('Class Name:', className);
        console.log('Description:', classDescription);

        alert(`The class "${className}" would be sent to the backend now.`);
        
        // Clears the form after submission
        addClassForm.reset();
    });

    // Event: Add a click listener for each delete button
    deleteButtons.forEach(button => {
        button.addEventListener('click', () => {
            const classId = button.dataset.id; // Gets the 'data-id' from the button
            
            console.log(`Clicked to delete class with ID: ${classId}`);
            
            // Visual simulation of deletion
            if (confirm(`Are you sure you want to delete the class with ID ${classId}?`)) {
                alert(`The action to delete class ${classId} would be sent to the backend.`);
                // Here you could remove the element from the screen, for example:
                // button.parentElement.remove();
            }
        });
    });

});