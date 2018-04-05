$(function () {
    'use strict';

    // Add contact to address book.
    $('#id_add_company_to_address_book').on('click', function () {
        var company_for_add_name = $(this).data('company-for-add-name');

        $.post($(this).data('add-company-to-address-book-url'), function (response) {
            if (response === 'success') {
                $('#id_add_company_to_address_book').hide();
                $('#id_remove_company_from_address_book').show();

                $.alert({
                    title: 'Well done!',
                    content: company_for_add_name + ' has been added to your address book.',
                });
            } else {
                $.alert({
                    title: 'Error!',
                    content: 'something is wrong. Please reload and try again.',
                });
            }
        });
    });

    // remove contact from address book.
    $('#id_remove_company_from_address_book').on('click', function () {
        var company_for_remove_name = $(this).data('company-for-remove-name');

        $.post($(this).data('remove-company-from-address-book-url'), function (response) {
            if (response === 'success') {
                $('#id_add_company_to_address_book').show();
                $('#id_remove_company_from_address_book').hide();

                $.alert({
                    title: 'Well done!',
                    content: company_for_remove_name + ' has been removed from your address book.',
                });
            } else {
                $.alert({
                    title: 'Error!',
                    content: 'something is wrong. Please reload and try again.',
                });
            }
        });
    });
})
