$(document).ready(function () {
  let contacts = JSON.parse(localStorage.getItem("contacts")) || [];

  function saveContactsToLocalStorage() {
    localStorage.setItem("contacts", JSON.stringify(contacts));
  }

  $("#welcome-screen").fadeIn();
  setTimeout(function () {
    $("#welcome-screen").fadeOut();
  }, 3000);

  function showMessage(message, color) {
    const messageDiv = $("#message");
    messageDiv.text(message);
    messageDiv.addClass(color + "-message");
    messageDiv
      .fadeIn()
      .delay(5000)
      .fadeOut(function () {
        $(this).removeClass(color + "-message");
      });
  }

  function updateContactList(contactArray = contacts) {
    const contactList = $("#contacts-list");
    contactList.empty();

    const table = $("<table>").addClass("contacts-list");
    const tableHead = $("<thead>");
    const tableHeadRow = $("<tr>");

    const attributes = ["First Name", "Surname", "Phone Number", "Address", ""];
    attributes.forEach((attribute) => {
      const th = $("<th>").text(attribute);
      tableHeadRow.append(th);
    });

    tableHead.append(tableHeadRow);
    table.append(tableHead);

    const tableBody = $("<tbody>");

    contactArray.forEach((contact, index) => {
      const row = $("<tr>");

      const nameTd = $("<td>").text(contact.firstName);
      const surnameTd = $("<td>").text(contact.surname || "-");
      const phoneTd = $("<td>").text(contact.phone);
      const addressTd = $("<td>").text(contact.address || "-");

      const actionsTd = $("<td>");
      const editBtn = $("<button>")
        .text("Edit")
        .attr("data-index", index)
        .addClass("edit-btn");
      const deleteBtn = $("<button>")
        .text("Delete")
        .attr("data-index", index)
        .addClass("delete-btn");

      actionsTd.append(editBtn, deleteBtn);
      row.append(nameTd, surnameTd, phoneTd, addressTd, actionsTd);
      tableBody.append(row);
    });

    table.append(tableBody);
    contactList.append(table);
  }

  function clearInputFields() {
    $("#first-name").val("");
    $("#surname").val("");
    $("#phone").val("");
    $("#address").val("");
  }

  $("#add-btn").click(function () {
    $(".add-contact-popup").fadeIn();
    $(".add-contact-popup").css("display", "flex");
    clearInputFields();
    soundMessage("open");
  });

  $("#close-btn").click(function () {
    $(".add-contact-popup").fadeOut();
    soundMessage("close");
  });

  $("#save-btn").click(function () {
    const firstName = $("#first-name").val().trim();
    const phone = $("#phone").val().trim();

    if (firstName === "" && phone === "") {
      showMessage("Please fill in the first name and phone number", "red");
      return;
    }

    if (firstName === "") {
      showMessage("Please fill in the first name", "red");
      return;
    }

    if (phone === "") {
      showMessage("Please fill in phone number", "red");
      return;
    }

    if (isNaN(phone)) {
      showMessage("This is not a valid phone number", "red");
      return;
    }

    const phoneDigits = phone.replace(/\D/g, "");
    if (phoneDigits.length < 7 || phoneDigits.length > 15) {
      showMessage("Phone number must be from 6 to 14 digits", "red");
      return;
    }

    if (contacts.some((contact) => contact.phone === phone)) {
      showMessage("The number is already saved in the list", "red");
      return;
    }

    const surname = $("#surname").val().trim();
    const address = $("#address").val().trim();

    const newContact = {
      firstName,
      surname,
      phone,
      address,
    };

    contacts.push(newContact);
    saveContactsToLocalStorage();
    updateContactList();
    $(".add-contact-popup").fadeOut(); // or set display to none
    showMessage("New contact saved successfully", "green");
    soundMessage("added");
  });

  $(document).on("click", ".edit-btn", function () {
    $(".edit-contact-popup").fadeIn();
    $(".edit-contact-popup").css("display", "flex");
    const index = $(this).data("index");
    openEditModal(index);
    soundMessage("open");
  });

  function openEditModal(index) {
    const contact = contacts[index];
    $("#edit-contact-id").val(index);
    $("#edit-first-name").val(contact.firstName);
    $("#edit-surname").val(contact.surname);
    $("#edit-phone").val(contact.phone);
    $("#edit-address").val(contact.address);
    $(".edit-contact-popup").fadeIn();
  }

  $("#update-btn").click(function () {
    const index = $("#edit-contact-id").val();
    const firstName = $("#edit-first-name").val();
    const surname = $("#edit-surname").val();
    const phone = $("#edit-phone").val();
    const address = $("#edit-address").val();

    if (
      firstName === contacts[index].firstName &&
      surname === contacts[index].surname &&
      phone === contacts[index].phone &&
      address === contacts[index].address
    ) {
      showMessage("No updates were made", "red");
    } else {
      const updatedContact = {
        firstName,
        surname,
        phone,
        address,
      };

      $(".edit-contact-popup").fadeOut();
      contacts[index] = updatedContact;
      saveContactsToLocalStorage();
      updateContactList();
      showMessage("Contact updated successfully", "yellow");
      soundMessage("updated");
    }
  });

  $("#close-edit-btn").click(function () {
    $(".edit-contact-popup").fadeOut();
    soundMessage("close");
  });

  $(document).on("click", ".delete-btn", function () {
    const index = $(this).data("index");
    const contactName =
      contacts[index].firstName + " " + contacts[index].surname;
    $(".warning-msg-popup").css("display", "flex");
    $("#delete-confirm").text(
      "Are you sure you want to delete the contact: " + contactName + "?"
    );
    var audio = new Audio("./sound_effect/Warning.mp3");
    audio.play();

    $("#red-btn").click(function () {
      $(".warning-msg-popup").fadeOut();
      contacts.splice(index, 1);
      saveContactsToLocalStorage();
      updateContactList();
      showMessage("Contact deleted successfully", "red");
      soundMessage("deleted");
    });

    $("#blue-btn").click(function () {
      $(".warning-msg-popup").fadeOut();
    });
  });

  function soundMessage(action) {
    var audio = new Audio("./sound_effect/" + action + ".mp3");
    audio.play();
  }

  $("#search-input").on("input", function () {
    const searchTerm = $(this).val().toLowerCase();
    const filteredContacts = contacts.filter((contact) => {
      const fullName = (
        contact.firstName +
        " " +
        contact.surname
      ).toLowerCase();
      return fullName.includes(searchTerm);
    });

    if (filteredContacts.length === 0 && searchTerm !== "") {
      $("#contacts-list").html(
        '<p class="no-contact-message">This contact is not in the list</p>'
      );
    } else {
      updateContactList(filteredContacts);
    }
  });

  updateContactList();
});
