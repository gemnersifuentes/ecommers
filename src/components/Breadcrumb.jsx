import { Link } from 'react-router-dom';

const Breadcrumb = ({ items }) => {
    return (
        <nav className="flex items-center text-sm text-gray-500">
            {items.map((item, index) => (
                <div key={index} className="flex items-center">
                    {index > 0 && <span className="mx-2">&gt;</span>}
                    {item.link ? (
                        <Link
                            to={item.link}
                            className="hover:text-blue-600 transition-colors flex items-center gap-1"
                        >
                            {index === 0 && item.isHome ? (
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                                </svg>
                            ) : (
                                item.label
                            )}
                        </Link>
                    ) : (
                        <span className="text-gray-700 flex items-center gap-1">
                            {index === 0 && item.isHome ? (
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                                </svg>
                            ) : (
                                item.label
                            )}
                        </span>
                    )}
                </div>
            ))}
        </nav>
    );
};

export default Breadcrumb;
