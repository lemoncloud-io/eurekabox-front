import type { Message } from '../types';

interface UserMessageProps {
    message: Message;
}

export const UserMessage = ({ message }: UserMessageProps) => {
    return (
        <div className="pt-[10px] pb-[14px] flex flex-col items-end justify-end">
            {message.attachments?.map(attachment => (
                <div
                    key={attachment.id}
                    className="w-[160px] h-auto overflow-hidden rounded-[10px] border border-[#DFE0E2] dark:border-[#53555B] mb-3 cursor-pointer"
                >
                    <img className="object-cover" src={attachment.url} alt={attachment.name} />
                </div>
            ))}
            <div className="py-2 px-[14px] max-w-[292px] bg-[#F4F5F5] dark:bg-[#3A3C40] rounded-tl-[18px] rounded-tr-[3px] rounded-br-[18px] rounded-bl-[18px]">
                {message.content}
            </div>
        </div>
    );
};
