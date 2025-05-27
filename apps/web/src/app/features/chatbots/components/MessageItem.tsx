import { AssistantMessage } from './AssistantMessage';
import { UserMessage } from './UserMessage';
import type { Message } from '../types';

interface MessageItemProps {
    message: Message;
}

export const MessageItem = ({ message }: MessageItemProps) => {
    if (message.role === 'user') {
        return <UserMessage message={message} />;
    }

    return <AssistantMessage message={message} />;
};
