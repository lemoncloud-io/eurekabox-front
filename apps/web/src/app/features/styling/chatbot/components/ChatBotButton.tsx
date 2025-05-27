import { Images } from '@eurekabox/assets';
import { useTheme } from '@eurekabox/theme';

export const ChatBotButton = () => {
    const { isDarkTheme } = useTheme();

    return (
        <button className="fixed bottom-6 right-6 rounded-full w-[62px] h-[62px] flex items-center justify-center border-[#7932FF] border-[0.5px] bg-chatbot-card shadow-[2px_2px_10px_0px_rgba(0,0,0,0.10)] overflow-hidden">
            <img
                src={isDarkTheme ? Images.chatBotDark : Images.chatBot}
                alt="chatbot button"
                className="w-[51px] h-[51px]"
            />
        </button>
    );
};
