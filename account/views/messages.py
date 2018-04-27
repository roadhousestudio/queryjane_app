import functools

from django.conf import settings
from django.contrib.auth.mixins import LoginRequiredMixin
from django.db import transaction
from django.utils import timezone
from django.http import Http404
from django.http import HttpResponse
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.template.loader import render_to_string
from django.views.generic import FormView
from django.views.generic import ListView
from django.views.generic import View

from account.data import NEW_MESSAGE_TO_COMPANY
from account.forms import UserMessageForm
from account.models import User
from account.models import Conversation
from account.models import UserMessage
from account.models import UserNotification
from account.permissions import ConversationsPermissions
from app.mixins import CustomUserMixin
from app.tasks import send_email
from entrepreneur.data import ACTIVE_MEMBERSHIP
from entrepreneur.data import OWNER
from entrepreneur.data import QJANE_ADMIN
from entrepreneur.models import Venture


class InboxView(LoginRequiredMixin, ListView):
    model = UserMessage
    template_name = 'account/inbox.html'
    context_object_name = 'conversations_list'

    def get_queryset(self):
        return Conversation.objects.filter(
            participating_users__in=[self.request.user],
        )


class UserMessageFormView(LoginRequiredMixin, FormView):
    form_class = UserMessageForm

    def get_object(self):
        return self.request.user.professionalprofile

    @transaction.atomic
    def form_valid(self, form):
        user_message = form.cleaned_data['user_message']
        user_to_id = form.cleaned_data['user_to_id']
        company_to_id = form.cleaned_data['company_to_id']
        company_from_id = form.cleaned_data['company_from_id']

        if user_to_id:
            user_to = User.objects.get(id=user_to_id)

            if company_from_id:
                conversation_list = functools.reduce(
                    lambda qs, pk: qs.filter(participating_users=pk),
                    [user_to.id],
                    Conversation.objects.filter(
                        participating_company_id=company_from_id,
                    ),
                )

                if conversation_list:
                    conversation = conversation_list[0]

                else:
                    conversation = Conversation.objects.create(
                        participating_company_id=company_from_id,
                    )
                    conversation.participating_users.add(user_to.id)

            else:
                conversation_list = functools.reduce(
                    lambda qs, pk: qs.filter(participating_users=pk),
                    [user_to.id, self.request.user.id],
                    Conversation.objects.all()
                )
                if conversation_list:
                    conversation = conversation_list[0]

                else:
                    conversation = Conversation.objects.create()
                    conversation.participating_users = [
                        user_to.id,
                        self.request.user.id,
                    ]

            message = UserMessage.objects.create(
                company_from_id=company_from_id,
                user_from=self.request.user,
                user_to=user_to,
                message=user_message,
                conversation=conversation,
            )

            conversation.updated_at = timezone.now()
            conversation.save()

            if user_to.professionalprofile.email_messages_notifications:
                subject = 'You have received a new message from {0}'.format(
                    self.request.user,
                )

                body = render_to_string(
                    'account/emails/new_private_message.html', {
                        'title': subject,
                        'message': message,
                        'base_url': settings.BASE_URL,
                    },
                )

                send_email(
                    subject=subject,
                    body=body,
                    mail_to=[user_to.email],
                )

        if company_to_id:
            company_to = Venture.objects.get(id=company_to_id)

            if Conversation.objects.filter(
                participating_users__in=[self.request.user],
                participating_company=company_to,
            ):
                conversation = Conversation.objects.filter(
                    participating_users__in=[self.request.user],
                    participating_company=company_to,
                )[0]
            else:
                conversation = Conversation.objects.create(
                    participating_company=company_to,
                )
                conversation.participating_users = [self.request.user.id]

            conversation.updated_at = timezone.now()
            conversation.save()

            message = UserMessage.objects.create(
                user_from=self.request.user,
                company_to=company_to,
                message=user_message,
                conversation=conversation,
            )

            description = '{0} has received a new message'.format(company_to)

            # Create new message notification for company administrators.
            for membership in company_to.administratormembership_set.filter(
                status=ACTIVE_MEMBERSHIP,
                role__in=(OWNER, QJANE_ADMIN),
            ):
                user = membership.admin.user

                UserNotification.objects.create(
                    notification_type=NEW_MESSAGE_TO_COMPANY,
                    noty_to=user,
                    answered=True,
                    description=description,
                    venture_to=company_to,
                    created_by=self.request.user.professionalprofile,
                )

                if user.professionalprofile.new_company_messages_notifications:
                    subject = description

                    body = render_to_string(
                        'account/emails/new_private_message.html', {
                            'title': subject,
                            'message': message,
                            'base_url': settings.BASE_URL,
                        },
                    )

                    send_email(
                        subject=subject,
                        body=body,
                        mail_to=[user.email],
                    )

        return HttpResponse('success')


class LoadConversationView(CustomUserMixin, View):
    def test_func(self):
        return ConversationsPermissions.can_view(
            user=self.request.user,
            conversation=self.get_object(),
        )

    def get_object(self):
        return get_object_or_404(
            Conversation,
            pk=self.kwargs['pk'],
        )

    @transaction.atomic
    def post(self, request, *args, **kwargs):
        conversation = self.get_object()

        UserMessage.objects.filter(
            user_to=request.user,
            unread=True,
            conversation=conversation,
        ).update(unread=False)

        return JsonResponse(
            {
                'content': render_to_string(
                    'modals/conversation_table.html',
                    context={
                        'conversation': conversation,
                    },
                    request=self.request,
                ),
                'new_messages_counter': UserMessage.objects.filter(
                    user_to=request.user,
                    unread=True,
                ).count()
            }
        )

    def get(self, *args, **kwargs):
        raise Http404('Method not available')
