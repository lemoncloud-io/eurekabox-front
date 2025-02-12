import { useState } from 'react';

import { FileText } from 'lucide-react';

import { Button } from '@eurekabox/lib/components/ui/button';
import { Card } from '@eurekabox/lib/components/ui/card';
import { Separator } from '@eurekabox/lib/components/ui/separator';

import { EditorLayout } from '../layouts/EditorLayout';

export const HomePage = () => {
    const [title, setTitle] = useState<string>('TODO: Create Home');

    return (
        <EditorLayout title={title} isLoading={false} onTitleChange={setTitle}>
            <div className="px-20 py-6 max-md:p-6 max-md:pl-10 w-full flex justify-center max-w-screen-xl mx-auto">
                <div className="w-full">
                    <div className="text-[28px] font-semibold mb-4">Home</div>
                    <div className="text-text-800 mb-[10px]">My Page</div>
                    <Card className="p-2 rounded-[6px]">
                        <Button
                            variant="ghost"
                            className="w-full h-[29px] justify-start font-normal text-text-700 px-1"
                        >
                            <FileText className="h-4 w-4" />
                            <span className="flex-1 text-left truncate w-0">New Page</span>
                        </Button>
                        <Separator className="my-[6px]" />
                        <Button
                            variant="ghost"
                            className="w-full h-[29px] justify-start font-normal text-text-700 px-1"
                        >
                            <FileText className="h-4 w-4" />
                            <span className="flex-1 text-left truncate w-0">New Page</span>
                        </Button>
                        <button className="underline text-text-700 mt-[10px] ml-1">View more</button>
                    </Card>
                </div>
            </div>
        </EditorLayout>
    );
};
