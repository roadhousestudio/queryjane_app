(function () {
  $.validator.addMethod("valid_password", function(value, element) {
      return this.optional(element) || /^(?=.*\d)(?!.*\s)(?=.*[a-zA-Z]).{8,}$/.test(value);
  }, "La contraseña debe tener al menos una letra y un número. Los caracteres no pueden ser todos iguales.");


  $.validator.addMethod(
      'filesize',
      function (value, element, param) {
          return this.optional(element) || (element.files[0].size <= param)
      },
      'El tamaño del archivo debe ser inferior a 4MB.'
  );

  $.validator.addMethod(
      'facebookURL',
      function (value, element) {
          return this.optional(element) || /^(https?:\/\/)?((w{3}\.)?)facebook.com\/.*/i.test(value);
      },
      'Please enter a valid Facebook url.'
  );

  $.validator.addMethod(
      'twitterURL',
      function (value, element) {
          return this.optional(element) || /^(https?:\/\/)?((w{3}\.)?)twitter.com\/.*/i.test(value);
      },
      'Please enter a valid Twitter url.'
  );

  $.validator.addMethod(
      'instagramURL',
      function (value, element) {
          return this.optional(element) || /^(https?:\/\/)?((w{3}\.)?)instagram.com\/.*/i.test(value);
      },
      'Please enter a valid Instagram url.'
  );

  $.validator.addMethod(
      'linkedinURL',
      function (value, element) {
          return this.optional(element) || /^(https?:\/\/)?((w{3}\.)?)linkedin.com\/.*/i.test(value);
      },
      'Please enter a valid Linkedin url.'
  );

  $.validator.addMethod(
      'GPlusURL',
      function (value, element) {
          return this.optional(element) || /^(https?:\/\/)?((w{3}\.)?)plus.google.com\/.*/i.test(value);
      },
      'Please enter a valid Google Plus url.'
  );

  var mqDetector;

  mqDetector = new MediaQueryDetector({
      $target: $('#mq-detector')
  });

   $.ajaxSetup({
       beforeSend: function(xhr, settings) {
           function getCookie(name) {
               var cookieValue = null;
               if (document.cookie && document.cookie != '') {
                   var cookies = document.cookie.split(';');
                   for (var i = 0; i < cookies.length; i++) {
                       var cookie = jQuery.trim(cookies[i]);
                       // Does this cookie string begin with the name we want?
                       if (cookie.substring(0, name.length + 1) == (name + '=')) {
                           cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                           break;
                       }
                   }
               }
               return cookieValue;
           }
           if (!(/^http:.*/.test(settings.url) || /^https:.*/.test(settings.url))) {
               // Only send the token to relative URLs i.e. locally.
               xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
           }
       }
  });

  // Jquery validate defaults
  $.validator.setDefaults({
      validClass: 'valid',
      errorClass: 'invalid',
      ignore: ":hidden, [contenteditable='true']:not([name])",
      highlight: function (element, errorClass, validClass) {
          var $field = $(element);

          $field.closest('.form-group').addClass(errorClass);
          $field.closest('.form-group').removeClass(validClass);
      },
      unhighlight: function (element, errorClass, validClass) {
          var $field = $(element);

          $field.closest('.form-group').removeClass(errorClass);
          $field.closest('.form-group').addClass(validClass);
      }
  });

  // Login inline validations
  $('.qjane-login-form-desktop').validate({
      rules: {
          'login_form-email': {
              minlength: 2,
              maxlength: 40,
              email: true,
              required: true
          },
          'login_form-password': {
              minlength: 8,
              valid_password: true,
              required: true,

          }
      }
  });

  $('.qjane-login-form-mobile').validate({
      rules: {
          'login_form-email': {
              minlength: 2,
              maxlength: 40,
              email: true,
              required: true
          },
          'login_form-password': {
              minlength: 8,
              valid_password: true,
              required: true,

          }
      }
  });

  // Ajax_login form submit
  $('.qjane-navbar-login-container').on('submit', '.qjane-login-form-desktop, .qjane-login-form-mobile', function () {
      'use strict';

      var url = $(this).data('login-form-url');
      var $self = $(this);

      $.post(url, $(this).serialize(), function (response) {
          if (response === 'fail') {
              $('.qjane-login-forms-error-message')
                  .show()
                  .addClass('mb-xs')
                  .text('We do not recognize this email address.');
              return;
          }  else if (response === 'data_error') {
              $('.qjane-login-forms-error-message')
                  .show()
                  .addClass('mb-xs')
                  .text('Contraseña incorrecta.');
              return;
          } else if (response === 'inactive_account') {
              $('.qjane-login-forms-error-message')
                  .show()
                  .addClass('mb-xs')
                  .text('The account associated with this email is inactive.');
              return;
          } else if (response === 'successful_login') {
              window.location.href = $self.data('redirect-url');
              return;
          }
      });

      return false;
  });

$('#id-qjane-home-signup-form').validate({
    rules: {
        first_name: {
            minlength: 2,
            maxlength: 40,
            required: true
        },
        last_name: {
            minlength: 2,
            maxlength: 40,
            required: true
        },
        email: {
            email: true,
            required: true
        },
        password: {
            minlength: 8,
            valid_password: true,
            required: true
        }
    }
});

  // Populate general message modal with new notification detail.
  $('.header-notification-list, .QjaneNotificationsList').on('click', '.qjane-notification-link', function () {
      var notification_url = $(this).data('notification-url');

      // Remove active class
      $(this).closest('tr').removeClass("active");
      $(this).parent().find('.JSNotificationStatus').removeClass('fa-eye-slash').addClass('fa-eye');

      $.post(notification_url).done(function (response) {
          if (response != 'fail') {
              $('#generalModalMessage .modal-content').html(response.content);
              $('.NewNotificationsCounter').text(response.new_notifications_counter);
          } else {
            alert('something is wrong. Please reload and try again.');
          }
      });
  });

  // Set global methods
  qjGlobal.mqDetector = mqDetector;

  // Handle selecting menu item for the current viewed page.
  var setNavigation = function() {
      // Get url path.
      var path = window.location.pathname;
      path = path.replace(/\/$/, "");
      path = decodeURIComponent(path);

      // Add active class to menu item.
      $('.enable-js-active a').each(function () {
          // Remove last slash from href.
          var href = $(this).attr('href');
          href = href.substring(0, href.length - 1);

          if (path.substring(0, href.length) === href) {
              $(this).closest('li').addClass('active');
          }
      });
  };

  // Activate current navigation menu item.
  setNavigation();
})();
