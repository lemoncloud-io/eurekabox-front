import { ChevronRight, ChevronUp } from 'lucide-react';

import type { RelatedDocument } from '../types';

interface RelatedDocumentsProps {
    documents: RelatedDocument[];
    isOpen: boolean;
    onToggle: () => void;
}

export const RelatedDocuments = ({ documents, isOpen, onToggle }: RelatedDocumentsProps) => {
    return (
        <div>
            <div className="flex items-center gap-1 pl-[3px] mb-1 cursor-pointer" onClick={onToggle}>
                <div className="text-[#007AFF] text-xs">관련문서</div>
                <ChevronUp
                    className={`text-[#007AFF] w-[13px] h-[13px] transform transition-transform duration-200 ${
                        isOpen ? 'rotate-0' : 'rotate-180'
                    }`}
                />
            </div>

            {isOpen && (
                <div className="py-[2px] px-[9px] bg-[#F4F5F5] dark:bg-[#3A3C40] rounded-lg w-fit max-w-full">
                    <ul className="flex flex-col space-y-[3px]">
                        {documents.map(doc => (
                            <li key={doc.id} className="flex items-center gap-[3px] cursor-pointer text-text-800">
                                <div className="text-xs truncate hover:underline">{doc.title}</div>
                                <ChevronRight className="w-[13px] h-[13px] shrink-0" />
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};
