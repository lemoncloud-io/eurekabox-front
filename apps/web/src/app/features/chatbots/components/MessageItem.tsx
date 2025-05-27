import { AssistantMessage } from './AssistantMessage';
import { UserMessage } from './UserMessage';
import type { Message } from '../types';

interface MessageItemProps {
    message: Message;
    onEdit?: (messageId: string) => void;
}

export const MessageItem = ({ message, onEdit }: MessageItemProps) => {
    if (message.role === 'user') {
        return <UserMessage message={message} />;
    }

    return <AssistantMessage message={message} onEdit={onEdit} />;
};
