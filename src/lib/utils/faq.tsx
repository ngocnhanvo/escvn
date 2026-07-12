import { useState } from "react";
import ChevronDown from 'lucide-react/dist/esm/icons/chevron-down';
import ChevronUp from 'lucide-react/dist/esm/icons/chevron-up';

export const FaqItem = ({ question, answer }: { question: string; answer: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border border-gray-200 bg-white rounded-xl mb-3 overflow-hidden transition-all">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-4 font-semibold text-left text-gray-800 hover:text-blue-600 transition-colors gap-4"
            >
                <span className="text-sm md:text-base">{question}</span>
                <span className="text-gray-400 flex-shrink-0">
                    {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </span>
            </button>
            <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    isOpen ? 'max-h-[500px] border-t border-gray-100' : 'max-h-0'
                }`}
            >
                <div 
                    className="p-4 text-base bg-gray-50/50 leading-relaxed [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mt-2 [&>ul]:space-y-1 [&>a]:text-blue-600 [&>a]:underline"
                    dangerouslySetInnerHTML={{ __html: answer }}
                />
            </div>
        </div>
    );
};