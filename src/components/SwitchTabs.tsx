

import React, { useState } from 'react';

interface TabProps {
    label: string;
    children: React.ReactNode;
}

interface TabsProps {
    children: React.ReactElement<TabProps>[];
}

export const Tab: React.FC<TabProps> = ({ children }) => {
    return <>{children}</>;
};

export const Tabs: React.FC<TabsProps> = ({ children }) => {
    const [activeTab, setActiveTab] = useState(0);

    return (
        <div>
            <div className="flex border-b">
                {children.map((tab, index) => (
                    <button
                        key={index}
                        className={`px-4 py-2 ${activeTab === index ? 'border-b-2 border-blue-500' : ''}`}
                        onClick={() => setActiveTab(index)}
                    >
                        {tab.props.label}
                    </button>
                ))}
            </div>
            <div className="p-4">
                {children[activeTab]}
            </div>
        </div>
    );
};