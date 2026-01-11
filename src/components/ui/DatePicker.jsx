import React from 'react';
import { format, parseISO, isValid } from 'date-fns';
import { es } from 'date-fns/locale';
import { DayPicker } from 'react-day-picker';
import * as Popover from '@radix-ui/react-popover';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import 'react-day-picker/style.css';


const DatePicker = ({
    value,
    onChange,
    placeholder = "Seleccionar fecha",
    label,
    className = ""
}) => {
    // Ensure value is a string in YYYY-MM-DD format or null
    const dateValue = value ? (typeof value === 'string' ? parseISO(value) : value) : null;

    return (
        <div className={`space-y-1.5 ${className}`}>
            {label && (
                <label className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest block">
                    {label}
                </label>
            )}
            <Popover.Root>
                <Popover.Trigger asChild>
                    <button
                        type="button"
                        className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-[#0b1437] border border-gray-200 dark:border-white/10 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none transition-all dark:text-white flex items-center gap-3 relative text-left"
                    >
                        <CalendarIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <span className={!value ? "text-gray-400" : ""}>
                            {value && isValid(dateValue)
                                ? format(dateValue, 'PPPP', { locale: es })
                                : placeholder}
                        </span>
                        {value && (
                            <div
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onChange('');
                                }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg transition-all text-gray-400 hover:text-red-500"
                            >
                                <X size={12} />
                            </div>
                        )}
                    </button>
                </Popover.Trigger>
                <Popover.Portal>
                    <Popover.Content
                        className="z-[100] bg-white dark:bg-[#111c44] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl p-4 animate-in fade-in zoom-in duration-200"
                        sideOffset={5}
                        align="start"
                    >
                        <style>{`
                            .rdp-root {
                                --rdp-accent-color: #2563eb;
                                --rdp-accent-background-color: #2563eb;
                                margin: 0;
                            }
                            .dark .rdp-root {
                                color: white;
                            }
                            /* Force the grid layout that v9 sometimes loses when using custom classNames */
                            .rdp-month_grid {
                                display: table;
                                width: 100%;
                            }
                            .rdp-weekdays {
                                display: table-header-group;
                            }
                            .rdp-weekday {
                                display: table-cell;
                                width: 2.25rem;
                            }
                            .rdp-weeks {
                                display: table-row-group;
                            }
                            .rdp-week {
                                display: table-row;
                            }
                            .rdp-day {
                                display: table-cell;
                                width: 2.25rem;
                                height: 2.25rem;
                                vertical-align: middle;
                                text-align: center;
                            }
                        `}</style>
                        <DayPicker
                            mode="single"
                            selected={dateValue && isValid(dateValue) ? dateValue : undefined}
                            onSelect={(date) => {
                                if (date) {
                                    const offset = date.getTimezoneOffset()
                                    const localDate = new Date(date.getTime() - (offset * 60 * 1000))
                                    onChange(localDate.toISOString().split('T')[0]);
                                } else {
                                    onChange('');
                                }
                            }}
                            locale={es}
                            classNames={{
                                months: "relative",
                                month: "space-y-4",
                                month_caption: "flex justify-center py-2 mb-4 relative items-center",
                                caption_label: "text-xs font-black uppercase tracking-widest",
                                nav: "flex items-center gap-1 absolute right-0 top-2 z-10",
                                button_previous: "p-1.5 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-all",
                                button_next: "p-1.5 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-all",
                                month_grid: "w-full border-collapse",
                                weekdays: "",
                                weekday: "text-[10px] font-black text-gray-400 uppercase p-2 text-center",
                                weeks: "",
                                week: "",
                                day: "p-0",
                                day_button: "w-9 h-9 text-xs flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-all cursor-pointer outline-none mx-auto",
                                selected: "bg-blue-600 text-white hover:bg-blue-700 font-bold",
                                today: "text-blue-500 font-black underline underline-offset-4",
                                outside: "text-gray-300 dark:text-gray-600 opacity-50",
                                disabled: "text-gray-200 dark:text-gray-700 cursor-not-allowed"
                            }}
                        />
                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5 flex justify-between items-center">
                            <button
                                type="button"
                                onClick={() => {
                                    const today = new Date();
                                    const offset = today.getTimezoneOffset();
                                    const localToday = new Date(today.getTime() - (offset * 60 * 1000));
                                    onChange(localToday.toISOString().split('T')[0]);
                                }}
                                className="text-[9px] font-black text-blue-500 uppercase tracking-widest hover:bg-blue-50 dark:hover:bg-blue-500/10 px-3 py-2 rounded-lg transition-all"
                            >
                                Hoy
                            </button>
                            <Popover.Close className="text-[9px] font-black text-gray-400 uppercase tracking-widest hover:bg-gray-100 dark:hover:bg-white/5 px-3 py-2 rounded-lg transition-all">
                                Cerrar
                            </Popover.Close>
                        </div>
                    </Popover.Content>
                </Popover.Portal>
            </Popover.Root>
        </div>
    );
};


export default DatePicker;
