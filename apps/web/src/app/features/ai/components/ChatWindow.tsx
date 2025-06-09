import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';

import { Check, EllipsisVertical, Quote, X } from 'lucide-react';
import remarkGfm from 'remark-gfm';

import type { ChatView } from '@lemoncloud/ssocio-chatbots-api';

import { useChatMessages, useDocument } from '@eurekabox/chatbots';
import { toast } from '@eurekabox/lib/hooks/use-toast';
import { Button } from '@eurekabox/ui-kit/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@eurekabox/ui-kit/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@eurekabox/ui-kit/components/ui/dropdown-menu';

interface ChatWindowProps {
    chat: ChatView;
    onScroll: (index: number, event: React.UIEvent<HTMLDivElement>) => void;
    index: number;
    isSending?: boolean;
}

export const ChatWindow = ({ chat, onScroll, index, isSending }: ChatWindowProps) => {
    const { t } = useTranslation();
    // TODO: update value
    const isReadyToReaction = false;
    const containerRef = useRef<HTMLDivElement>(null);

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isFetching } = useChatMessages({
        rootId: chat.id,
        limit: -1,
    });

    const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
    const { data: selectedDocument } = useDocument(selectedDocId || '');

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop } = e.target as HTMLDivElement;
        onScroll(index, e);

        if (scrollTop === 0 && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    };

    useEffect(() => {
        if (containerRef.current && data?.pages) {
            if (containerRef.current) {
                containerRef.current.scrollTop = containerRef.current.scrollHeight;
            }
        }
    }, [data?.pages]);

    const handleFeedback = (messageId: string, isPositive: boolean) => {
        // TODO: Implement feedback API call
        toast({ title: `Message ${messageId} feedback: ${isPositive ? 'positive' : 'negative'}` });
    };

    const messages =
        data?.pages
            .reduce((acc, page) => [...acc, ...(page.data || [])], [])
            .filter(msg => msg.id && msg.content)
            .sort((a, b) => a.childNo - b.childNo) || [];

    return (
        <>
            <div ref={containerRef} onScroll={handleScroll} className="h-full overflow-y-auto p-2">
                {messages?.length > 0 ? (
                    messages?.map(message => (
                        <div
                            key={message.id}
                            className={`mb-4 flex ${message.stereo === 'query' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`relative max-w-[80%] group ${
                                    message.stereo === 'query'
                                        ? message.isError
                                            ? 'bg-accent rounded-2xl p-4 border-2 border-destructive hover:ring-2 hover:ring-offset-2 hover:ring-destructive transition-all'
                                            : 'bg-accent rounded-2xl p-4 hover:ring-2 hover:ring-offset-2 hover:ring-gray-300 transition-all'
                                        : message.isError
                                        ? 'bg-destructive text-destructive-foreground rounded-2xl p-4 hover:ring-2 hover:ring-offset-2 hover:ring-destructive transition-all'
                                        : 'bg-primary text-primary-foreground rounded-2xl p-4 hover:ring-2 hover:ring-offset-2 hover:ring-primary transition-all'
                                }`}
                            >
                                {message.documentIds && message.documentIds.length > 0 && (
                                    <div
                                        className={`absolute ${
                                            message.stereo === 'query'
                                                ? '-left-8 top-1/2 -translate-y-1/2'
                                                : '-right-8 top-1/2 -translate-y-1/2'
                                        } opacity-0 group-hover:opacity-100 transition-opacity`}
                                    >
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className={`h-6 w-6 p-0 ${
                                                        message.stereo === 'query' ? 'text-gray-500' : 'text-gray-500'
                                                    }`}
                                                >
                                                    <EllipsisVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align={message.stereo === 'query' ? 'start' : 'end'}>
                                                <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                                                    {t('ai.chatbot.reference_documents')}
                                                </div>
                                                {message.documentIds.map((documentId: string, idx: number) => (
                                                    <DropdownMenuItem
                                                        key={idx}
                                                        onClick={() => setSelectedDocId(documentId.split(':')[0])}
                                                    >
                                                        {documentId}
                                                    </DropdownMenuItem>
                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                )}
                                <div className="prose prose-sm dark:prose-invert max-w-none break-words overflow-hidden">
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                            table: ({ children, className, ...props }) => (
                                                <table
                                                    className={`${className || ''} ${
                                                        message.stereo === 'answer' ? 'text-primary-foreground' : ''
                                                    } border-collapse w-full my-4`}
                                                    {...props}
                                                >
                                                    {children}
                                                </table>
                                            ),
                                            thead: ({ children, className, ...props }) => (
                                                <thead
                                                    className={`${className || ''} ${
                                                        message.stereo === 'answer' ? 'text-primary-foreground' : ''
                                                    } bg-muted/50`}
                                                    {...props}
                                                >
                                                    {children}
                                                </thead>
                                            ),
                                            tbody: ({ children, className, ...props }) => (
                                                <tbody
                                                    className={`${className || ''} ${
                                                        message.stereo === 'answer' ? 'text-primary-foreground' : ''
                                                    }`}
                                                    {...props}
                                                >
                                                    {children}
                                                </tbody>
                                            ),
                                            tr: ({ children, className, ...props }) => (
                                                <tr
                                                    className={`${className || ''} ${
                                                        message.stereo === 'answer' ? 'text-primary-foreground' : ''
                                                    } border-b border-border/50`}
                                                    {...props}
                                                >
                                                    {children}
                                                </tr>
                                            ),
                                            th: ({ children, className, ...props }) => (
                                                <th
                                                    className={`${className || ''} ${
                                                        message.stereo === 'answer' ? 'text-primary-foreground' : ''
                                                    } p-2 text-left font-semibold`}
                                                    {...props}
                                                >
                                                    {children}
                                                </th>
                                            ),
                                            td: ({ children, className, ...props }) => (
                                                <td
                                                    className={`${className || ''} ${
                                                        message.stereo === 'answer' ? 'text-primary-foreground' : ''
                                                    } p-2`}
                                                    {...props}
                                                >
                                                    {children}
                                                </td>
                                            ),
                                            p: ({ children, className, ...props }) => (
                                                <p
                                                    className={`${className || ''} ${
                                                        message.stereo === 'answer' ? 'text-primary-foreground' : ''
                                                    }`}
                                                    {...props}
                                                >
                                                    {children}
                                                </p>
                                            ),
                                            strong: ({ children, className, ...props }) => (
                                                <strong
                                                    className={`${className || ''} ${
                                                        message.stereo === 'answer' ? 'text-primary-foreground' : ''
                                                    }`}
                                                    {...props}
                                                >
                                                    {children}
                                                </strong>
                                            ),
                                            em: ({ children, className, ...props }) => (
                                                <em
                                                    className={`${className || ''} ${
                                                        message.stereo === 'answer' ? 'text-primary-foreground' : ''
                                                    }`}
                                                    {...props}
                                                >
                                                    {children}
                                                </em>
                                            ),
                                            h1: ({ children, className, ...props }) => (
                                                <h1
                                                    className={`${className || ''} ${
                                                        message.stereo === 'answer' ? 'text-primary-foreground' : ''
                                                    }`}
                                                    {...props}
                                                >
                                                    {children}
                                                </h1>
                                            ),
                                            h2: ({ children, className, ...props }) => (
                                                <h2
                                                    className={`${className || ''} ${
                                                        message.stereo === 'answer' ? 'text-primary-foreground' : ''
                                                    }`}
                                                    {...props}
                                                >
                                                    {children}
                                                </h2>
                                            ),
                                            h3: ({ children, className, ...props }) => (
                                                <h3
                                                    className={`${className || ''} ${
                                                        message.stereo === 'answer' ? 'text-primary-foreground' : ''
                                                    }`}
                                                    {...props}
                                                >
                                                    {children}
                                                </h3>
                                            ),
                                            ul: ({ children, className, ...props }) => (
                                                <ul
                                                    className={`${className || ''} ${
                                                        message.stereo === 'answer' ? 'text-primary-foreground' : ''
                                                    }`}
                                                    {...props}
                                                >
                                                    {children}
                                                </ul>
                                            ),
                                            ol: ({ children, className, ...props }) => (
                                                <ol
                                                    className={`${className || ''} ${
                                                        message.stereo === 'answer' ? 'text-primary-foreground' : ''
                                                    }`}
                                                    {...props}
                                                >
                                                    {children}
                                                </ol>
                                            ),
                                            li: ({ children, className, ...props }) => (
                                                <li
                                                    className={`${className || ''} ${
                                                        message.stereo === 'answer' ? 'text-primary-foreground' : ''
                                                    }`}
                                                    {...props}
                                                >
                                                    {children}
                                                </li>
                                            ),
                                            blockquote: ({ children, className, ...props }) => (
                                                <blockquote
                                                    className={`${className || ''} ${
                                                        message.stereo === 'answer'
                                                            ? 'border-primary-foreground/30 text-primary-foreground'
                                                            : 'border-gray-300'
                                                    }`}
                                                    {...props}
                                                >
                                                    {children}
                                                </blockquote>
                                            ),
                                            code: ({ className, children, ...props }) => (
                                                <code
                                                    className={`${className} ${
                                                        message.stereo === 'answer' ? 'text-primary-foreground' : ''
                                                    }`}
                                                    {...props}
                                                >
                                                    {children}
                                                </code>
                                            ),
                                            pre: ({ children, className, ...props }) => (
                                                <pre
                                                    className={`${className || ''} ${
                                                        message.stereo === 'answer' ? 'text-primary-foreground' : ''
                                                    }`}
                                                    {...props}
                                                >
                                                    {children}
                                                </pre>
                                            ),
                                            a: ({ node, children, href, ...props }) => (
                                                <a
                                                    href={href}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={`${
                                                        message.stereo === 'answer' ? 'text-primary-foreground' : ''
                                                    } hover:underline`}
                                                    {...props}
                                                >
                                                    {children}
                                                </a>
                                            ),
                                            hr: ({ ...props }) => (
                                                <hr
                                                    className={`${props.className || ''} ${
                                                        message.stereo === 'answer'
                                                            ? 'border-primary-foreground/30'
                                                            : 'border-gray-200'
                                                    }`}
                                                    {...props}
                                                />
                                            ),
                                        }}
                                    >
                                        {message.content}
                                    </ReactMarkdown>
                                </div>
                                {message.stereo === 'query' && (
                                    <div className="absolute -bottom-2 -left-2 bg-background rounded-full p-1">
                                        <Quote className="h-3 w-3 text-gray-500" />
                                    </div>
                                )}
                                {isReadyToReaction && message.stereo === 'answer' && (
                                    <div className="absolute -bottom-3 right-0 invisible group-hover:visible flex gap-2">
                                        <button
                                            onClick={() => handleFeedback(message.id, false)}
                                            className="bg-background rounded-full p-1.5 hover:bg-destructive hover:text-destructive-foreground transition-colors shadow-sm"
                                        >
                                            <X className="h-4 w-4 text-muted-foreground hover:text-inherit" />
                                        </button>
                                        <button
                                            onClick={() => handleFeedback(message.id, true)}
                                            className="bg-background rounded-full p-1.5 hover:bg-success hover:text-success-foreground transition-colors shadow-sm"
                                        >
                                            <Check className="h-4 w-4 text-muted-foreground hover:text-inherit" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                ) : !isFetching && !isFetchingNextPage && !isSending ? (
                    <div className="text-center text-sm text-muted-foreground">{t('ai.chatbot.no_messages')}</div>
                ) : null}
                {(isFetching || isFetchingNextPage || isSending) && (
                    <div className="text-center text-sm text-muted-foreground p-2">
                        {isSending ? t('ai.chatbot.sending_message') : t('ai.chatbot.loading_messages')}
                    </div>
                )}
            </div>

            <Dialog open={!!selectedDocId} onOpenChange={() => setSelectedDocId(null)}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{t('ai.chatbot.reference_documents')}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        {selectedDocument ? (
                            <div className="whitespace-pre-wrap text-sm">
                                <div className="font-semibold mb-2">Document ID: {selectedDocument.id}</div>
                                <div>{selectedDocument.content}</div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 justify-center">
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};
