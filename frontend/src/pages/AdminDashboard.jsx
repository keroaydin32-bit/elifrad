import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Papa from 'papaparse';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

import {
    LayoutDashboard, ShoppingCart, Users, Package, Box, BarChart2, Settings, Bell, Search, Menu,
    ChevronDown, LogOut, Plus, Trash2, Edit3, RefreshCw, Filter, X, ExternalLink, User, Palette,
    Activity, HelpCircle, Shirt, Zap, Monitor, Cpu, Wrench, Share2, Folder, FolderPlus,
    PlusSquare, Check, CheckCircle2, Scale, Mail, AlertCircle, ChevronLeft, ChevronRight, Tag, Layers,
    Eye, Save, Loader2, PlusCircle, ArrowLeft, ArrowUp, ArrowDown, Image as ImageIcon,
    FileUp, Download, Scroll, Globe, MapPin, Upload, Star, Euro, ImagePlus, Calendar,
    CreditCard, Truck, Printer, FileText, Clock, History, Warehouse, FileStack, Bike, List, AlertTriangle, FileBox, Layout, MessageSquare, MoreHorizontal, RefreshCcw, UserPlus, Image as ImageLucide, Type
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '../components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { toast } from 'sonner';
import { Checkbox } from '../components/ui/checkbox';

import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { supabase } from '../supabase';

// Global styles for Quill to match dark mode and admin theme
const quillStyles = `
  .quill-dark-container {
    background: white;
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 50px;
    border: 1px solid rgba(0, 0, 0, 0.1);
  }
  .dark .quill-dark-container {
    background: #0a0a0a;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  .dark .ql-toolbar {
    background: #111 !important;
    border-color: rgba(255, 255, 255, 0.1) !important;
  }
  .dark .ql-container {
    border-color: rgba(255, 255, 255, 0.1) !important;
    color: white !important;
  }
  .dark .ql-stroke {
    stroke: #9ca3af !important;
  }
  .dark .ql-fill {
    fill: #9ca3af !important;
  }
  .dark .ql-picker {
    color: #9ca3af !important;
  }
  .dark .ql-picker-options {
    background-color: #111 !important;
    border-color: rgba(255, 255, 255, 0.1) !important;
    color: #9ca3af !important;
  }
  .ql-editor {
    min-height: 400px;
    font-family: inherit;
    line-height: 1.6;
    padding: 2rem !important;
    font-size: 1.35rem !important;
    color: #000 !important;
  }
  .dark .ql-editor {
    color: #fff !important;
  }
  .ql-editor.ql-blank::before {
    color: #6b7280 !important;
    font-style: italic;
  }

  /* Match LegalPage.jsx typography exactly */
  .ql-editor h1 { font-size: 2.5rem !important; font-weight: 950 !important; margin-top: 4rem !important; margin-bottom: 2rem !important; color: #000 !important; letter-spacing: -0.04em !important; text-transform: uppercase !important; border-left: 8px solid #dc2626 !important; padding-left: 1.5rem !important; line-height: 1 !important; }
  .dark .ql-editor h1 { color: #fff !important; border-left-color: #ef4444 !important; }
  
  .ql-editor h2 { font-size: 2rem !important; font-weight: 900 !important; margin-top: 3.5rem !important; margin-bottom: 1.5rem !important; color: #000 !important; letter-spacing: -0.02em !important; text-transform: uppercase !important; }
  .dark .ql-editor h2 { color: #fff !important; }

  .ql-editor h3 { font-size: 1.5rem !important; font-weight: 900 !important; margin-top: 2.5rem !important; margin-bottom: 1.25rem !important; color: #000 !important; text-transform: uppercase !important; }
  .dark .ql-editor h3 { color: #fff !important; }
  
  .ql-editor p { margin-bottom: 2rem !important; font-size: 1.35rem !important; color: inherit !important; line-height: 1.6 !important; }
  .ql-editor ul { list-style-type: disc !important; padding-left: 3rem !important; margin-bottom: 2.5rem !important; }
  .ql-editor ol { list-style-type: decimal !important; padding-left: 3rem !important; margin-bottom: 2.5rem !important; }
  .ql-editor li { margin-bottom: 1.25rem !important; font-size: 1.35rem !important; color: inherit !important; }
  
  .ql-editor strong { font-weight: 950 !important; color: #000 !important; }
  .dark .ql-editor strong { color: #fff !important; }
  
  .ql-editor a { color: #dc2626 !important; text-decoration: underline !important; font-weight: 950 !important; }
  .dark .ql-editor a { color: #ff1a1a !important; }

  .ql-editor img { max-width: 100% !important; height: auto !important; border-radius: 8px !important; margin: 2rem 0 !important; }
  .ql-editor iframe { width: 100% !important; aspect-ratio: 16/9 !important; border-radius: 12px !important; margin: 2rem 0 !important; }
`;

// Helper Component for Hierarchical Category Selection
const CategoryCheckboxTree = ({ categories, selectedIds, onToggle }) => {
    if (!categories || categories.length === 0) return null;
    return (
        <ul className="space-y-1.5 ml-4 border-l border-gray-100 dark:border-white/5 pl-4 mt-1">
            {categories.map(cat => (
                <li key={cat.id}>
                    <div className="flex items-center gap-2 py-1 group">
                        <Checkbox
                            id={`cat-${cat.id}`}
                            checked={selectedIds.includes(cat.id)}
                            onCheckedChange={() => onToggle(cat.id)}
                            className="h-4 w-4 border-gray-300 dark:border-white/20 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                        />
                        <Label
                            htmlFor={`cat-${cat.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer group-hover:text-red-600 transition-colors dark:text-gray-300 dark:group-hover:text-red-500"
                        >
                            {cat.name}
                        </Label>
                    </div>
                    {cat.subcategories && cat.subcategories.length > 0 && (
                        <CategoryCheckboxTree
                            categories={cat.subcategories}
                            selectedIds={selectedIds}
                            onToggle={onToggle}
                        />
                    )}
                </li>
            ))}
        </ul>
    );
};

const cleanStr = (val, fallback = "") => {
    if (!val) return fallback;
    return val.toString().trim();
};

const cleanHTML = (html) => {
    if (!html) return "";
    return html
        .replace(/&nbsp;/g, ' ')
        .replace(/<p>\s*<\/p>/g, '')
        .replace(/<p>&nbsp;<\/p>/g, '')
        .trim();
};

const CategoryIcon = ({ category, className = "w-5 h-5" }) => {
    const name = category?.name?.toLowerCase() || '';
    const icon = category?.icon;

    if (icon && typeof icon === 'string' && icon.length <= 4 && !['📁', '📂', '📄', '🗂️', '🏠'].includes(icon)) {
        return <span className="leading-none">{icon}</span>;
    }

    if (name.includes('bike') || name.includes('rad')) return <Bike className={className} />;
    if (name.includes('bekleidung') || name.includes('kleidung') || name.includes('shirt')) return <Shirt className={className} />;
    if (name.includes('zubehör') || name.includes('accessoires')) return <Package className={className} />;
    if (name.includes('ersatzteile') || name.includes('teile') || name.includes('parts')) return <Settings className={className} />;
    if (name.includes('elektronik') || name.includes('digital') || name.includes('technik')) return <Cpu className={className} />;
    if (name.includes('service') || name.includes('werkstatt')) return <Wrench className={className} />;
    if (name.includes('kontakt') || name.includes('hilfe')) return <HelpCircle className={className} />;
    if (name.includes('home') || name.includes('wohn') || name.includes('startseite')) return <Layers className={className} />;
    if (name.includes('kunst') || name.includes('art')) return <Palette className={className} />;
    if (name.includes('sport') || name.includes('fitness')) return <Activity className={className} />;
    if (name.includes('sonder') || name.includes('angebot') || name.includes('sale')) return <Zap className={className} />;

    return <Layers className={`${className} opacity-50`} />;
};

const promiseWithTimeout = (promise, ms, name = "Task") => {
    const timeout = new Promise((_, reject) => {
        setTimeout(() => reject(new Error(`${name} Timeout (${ms}ms)`)), ms);
    });
    return Promise.race([promise, timeout]);
};

const editorConfig = {
    readonly: false,
    zIndex: 10000,
    placeholder: "Beschreiben Sie den Artikel im Detail...",
    language: 'de',
    minHeight: 300,
    toolbarAdaptive: false,
    askBeforePasteHTML: false,
    askBeforePasteFromWord: false,
    defaultActionOnPaste: 'insert_as_html',
    defaultActionOnPasteFromWord: 'insert_as_html',
    processPasteHTML: false,
    defaultMode: '1',
    width: '100%',
    cleanPaste: true,
    style: {
        fontFamily: "'Roboto Condensed', sans-serif",
        fontSize: '16px'
    },
    controls: {
        font: {
            list: {
                "'Roboto Condensed', sans-serif": 'Roboto Condensed',
                "'Charis SIL', serif": 'Charis SIL',
                'Nunito Sans, sans-serif': 'Nunito Sans',
                'Rubik, sans-serif': 'Rubik',
                'Arial,Helvetica,sans-serif': 'Arial',
                'Georgia,serif': 'Georgia',
                'Impact,Charcoal,sans-serif': 'Impact',
                'Tahoma,Geneva,sans-serif': 'Tahoma',
                'Times New Roman,Times,serif': 'Times New Roman',
                'Verdana,Geneva,sans-serif': 'Verdana'
            }
        }
    },
    buttons: [
        'source', '|',
        'bold', 'strikethrough', 'underline', 'italic', '|',
        'ul', 'ol', '|',
        'outdent', 'indent', '|',
        'font', 'fontsize', 'brush', 'paragraph', '|',
        'image', 'video', 'table', 'link', '|',
        'align', 'undo', 'redo', '|',
        'hr', 'eraser', 'copyformat', '|',
        'symbol', 'fullsize'
    ],
    uploader: {
        insertImageAsBase64URI: true
    }
};

// Separate config for legal documents - paste-friendly, no dialogs
// Memoized stable config for legal documents - Quill modules
const quillModules = {
    toolbar: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'font': [] }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        [{ 'align': [] }],
        ['blockquote', 'code-block'],
        ['link', 'image', 'video'],
        ['clean']
    ],
    clipboard: {
        matchVisual: false,
    }
};

const quillFormats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'list', 'bullet', 'align',
    'blockquote', 'code-block',
    'link', 'image', 'video'
];

// Internal component for Color Picker to avoid full dashboard re-renders while dragging
const ColorPickerField = ({ value, onChange }) => {
    const [localValue, setLocalValue] = useState(value);

    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    return (
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
            <style>{`
                /* Ensure Jodit dropdowns and popups are ALWAYS on top of Radix/Shadcn Dialogs */
                .jodit-dropdown, 
                .jodit-popup, 
                .jodit-autocomplete, 
                .jodit-ui-group, 
                .jodit-ui-popup {
                    z-index: 2000000000 !important;
                }
                .jodit-dialog__box {
                    z-index: 2100000000 !important;
                }
                /* Robust font visibility and dropdown styling */
                .jodit-ui-list__item {
                    color: #000 !important;
                    background-color: #ffffff !important;
                    font-size: 14px !important;
                    padding: 8px 12px !important;
                }
                .jodit-ui-list__item:hover {
                    background-color: #f0f0f0 !important;
                }
                .jodit-ui-separator {
                    border-color: #eee !important;
                }
                /* Ensure all Jodit text in toolbar is visible */
                .jodit-toolbar-button__text {
                    color: inherit !important;
                }
            `}</style>
            <div className="relative w-10 h-10 shrink-0 group">
                <input
                    type="color"
                    value={localValue}
                    onChange={(e) => {
                        setLocalValue(e.target.value);
                    }}
                    onBlur={() => {
                        onChange(localValue);
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    title="Eigene Farbe wählen"
                />
                <div
                    className="w-full h-full rounded-md border shadow-sm flex items-center justify-center transition-transform group-hover:scale-105"
                    style={{ backgroundColor: localValue }}
                >
                    <Palette className="w-4 h-4 text-white mix-blend-difference opacity-70" />
                </div>
            </div>
            <Input
                value={localValue}
                onChange={(e) => {
                    setLocalValue(e.target.value);
                    if (e.target.value.length === 7) onChange(e.target.value);
                }}
                className="flex-1 rounded-md font-mono"
                placeholder="#000000"
            />
        </div>
    );
};

const AdminDashboard = () => {
    const {
        products: _unusedProducts, rawProducts: products, categories, flatCategories, manufacturers, loading, refreshData,
        setProducts, setFlatCategories, setCategories, setManufacturers,
        deliveryTimePresets, defaultDeliveryTime, addDeliveryTimePreset, removeDeliveryTimePreset, setDefaultDeliveryTime,
        taxRatePresets, defaultTaxRate, addTaxRatePreset, removeTaxRatePreset, setDefaultTaxRate,
        shopSettings, updateShopSettings, logout,
        shippingRates, setShippingRates
    } = useStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();

    // Mapping of paths to tabs
    const pathMap = {
        'Uebersicht': 'Übersicht',
        'Bestellungen': 'Bestellungen',
        'Rechnungen': 'Rechnungen',
        'Kunden': 'Kunden',
        'Kategorien-Artikel': 'Kategorien / Artikel',
        'Hersteller': 'Hersteller',
        'Warehouse': 'Depo / Inventur',
        'Module': 'Module',
        'Statistiken': 'Statistiken',
        'Statistiken-Artikel': 'Artikelstatistik',
        'Statistiken-Umsatz': 'Umsatzstatistik',
        'Statistiken-Kunden': 'Kundenstatistik',
        'Statistiken-Online': 'Wer ist online?',
        'Startseiten-Einstellungen': 'Startseiten-Einstellungen',
        'Versand-Einstellungen': 'Versand-Einstellungen',
        'Footer-Einstellungen': 'Inhalt & Rechtliches',
        'Einstellungen': 'Einstellungen'
    };

    // Derived state from URL path
    const pathParts = location.pathname.split('/').filter(Boolean); // ['admin', 'Kategorien-Artikel', ...]
    const activeTabKey = pathParts[1] || 'Uebersicht';
    const activeTab = pathMap[activeTabKey] || 'Übersicht';
    const subRoute = pathParts[2]; // 'neu-artikel' etc.

    const categoryFilter = searchParams.get('category') || 'all';

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [statsTab, setStatsTab] = useState('artikel'); // sub-tabs for statistics
    const [orders, setOrders] = useState(() => {
        try {
            const saved = localStorage.getItem('cached_admin_orders');
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    });
    const [ordersLoading, setOrdersLoading] = useState(() => {
        return !localStorage.getItem('cached_admin_orders');
    });
    const [customers, setCustomers] = useState(() => {
        try {
            const saved = localStorage.getItem('cached_admin_customers');
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    });
    const [customersLoading, setCustomersLoading] = useState(() => {
        return !localStorage.getItem('cached_admin_customers');
    });

    // Filter & Search states
    const [productSearch, setProductSearch] = useState('');
    const [showOnlyWarehouse, setShowOnlyWarehouse] = useState(false);

    // Modal & View states
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const fileInputRef = useRef(null);
    const mLogoInputRef = useRef(null);
    const mBannerInputRef = useRef(null);
    const [isImporting, setIsImporting] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const legalContentRef = useRef('');
    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = quillStyles;
        document.head.appendChild(style);
        return () => {
            if (document.head.contains(style)) {
                document.head.removeChild(style);
            }
        };
    }, []);

    const [lastSaveTimestamp, setLastSaveTimestamp] = useState(Date.now());
    const [formData, setFormData] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
    const [expandedCategories, setExpandedCategories] = useState({});
    const [isSubcategoryModalOpen, setIsSubcategoryModalOpen] = useState(false);
    const [selectedCategoryDetail, setSelectedCategoryDetail] = useState(null);
    const [categoryEditorView, setCategoryEditorView] = useState(null); // null, 'add', 'edit'
    const [productEditorView, setProductEditorView] = useState(null); // null, 'add', 'edit'
    const [selectedRowIds, setSelectedRowIds] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 70;
    const [isUploading, setIsUploading] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
    const [isSideDetailOpen, setIsSideDetailOpen] = useState(false);
    const [orderItems, setOrderItems] = useState([]);
    const [statusEdit, setStatusEdit] = useState('');
    const [shippingCarrier, setShippingCarrier] = useState('dhl');
    const [orderCustomer, setOrderCustomer] = useState(null);
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
    const [invoiceEditMode, setInvoiceEditMode] = useState(false);
    const [invoiceNotes, setInvoiceNotes] = useState('');
    const [isInvoiceStorniert, setIsInvoiceStorniert] = useState(false);

    const statusMap = {
        'pending': 'Wartend',
        'shipped': 'Versandt',
        'completed': 'Abgeschlossen',
        'storniert': 'Storniert'
    };

    // Manufacturer states - manufacturers data comes from StoreContext
    const manufacturersLoading = loading; // Use global loading state
    const [isManufacturerModalOpen, setIsManufacturerModalOpen] = useState(false);
    const [manufacturerFormData, setManufacturerFormData] = useState({
        name: '',
        logo_url: '',
        banner_url: '',
        website: '',
        description: '',
        address: '',
        city: '',
        zip_code: '',
        country: 'Deutschland',
        is_active: true
    });

    // --- EMERGENCY RESET EFFECT ---
    // If isSubmitting stays true for more than 60 seconds, something is likely wrong.
    useEffect(() => {
        let timer;
        if (isSubmitting) {
            timer = setTimeout(() => {
                console.warn("⚠️ [Safety] Save operation timeout detected. Resetting isSubmitting state.");
                setIsSubmitting(false);
            }, 60000); 
        }
        return () => clearTimeout(timer);
    }, [isSubmitting]);

    const [visitorStats, setVisitorStats] = useState({ total: 0, today: 0, weekly: [] });
    const [visitorsLoading, setVisitorsLoading] = useState(true);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [onlineLoading, setOnlineLoading] = useState(false);
    const [selectedOnlineUser, setSelectedOnlineUser] = useState(null);

    // Local form state for settings to allow editing before saving
    const [settingsForm, setSettingsForm] = useState(shopSettings);
    const [shippingRatesForm, setShippingRatesForm] = useState(shippingRates || []);
    const [isSavingRates, setIsSavingRates] = useState(false);
    const [isLegalEditorOpen, setIsLegalEditorOpen] = useState(false);

    // Art / Typ persistence & suggestions
    const [lastUsedArt, setLastUsedArt] = useState(() => {
        const saved = localStorage.getItem('last_used_art');
        // BLOCKED: Remove 'kerem' from ever being a default if found in storage
        if (saved === 'kerem') {
            localStorage.removeItem('last_used_art');
            return '';
        }
        return saved || '';
    });
    const [lastUsedMwst, setLastUsedMwst] = useState(() => localStorage.getItem('last_used_mwst') || '19');

    const uniqueArtTypes = useMemo(() => {
        if (!products) return [];
        const set = new Set();
        products.forEach(p => {
            // BLOCKED: Never suggest 'kerem' as an art type
            if (p.art && p.art.trim() && p.art.trim().toLowerCase() !== 'kerem') {
                set.add(p.art.trim());
            }
        });
        return Array.from(set).sort();
    }, [products]);

    // Attributes persistence & suggestions
    const [lastUsedAttributeLabels, setLastUsedAttributeLabels] = useState(() => {
        try {
            const saved = localStorage.getItem('last_used_attr_labels');
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    });

    const uniqueAttributeLabels = useMemo(() => {
        if (!products) return [];
        const set = new Set();
        products.forEach(p => {
            if (Array.isArray(p.attributes)) {
                p.attributes.forEach(attr => {
                    if (attr.label && attr.label.trim()) set.add(attr.label.trim());
                });
            }
        });
        return Array.from(set).sort();
    }, [products]);

    const uniqueAttributeValuesByLabel = useMemo(() => {
        if (!products) return {};
        const map = {};
        products.forEach(p => {
            if (Array.isArray(p.attributes)) {
                p.attributes.forEach(attr => {
                    if (attr.label && attr.label.trim()) {
                        const label = attr.label.trim();
                        if (!map[label]) map[label] = new Set();
                        if (attr.value && attr.value.trim()) map[label].add(attr.value.trim());
                    }
                });
            }
        });
        const finalMap = {};
        Object.keys(map).forEach(label => {
            finalMap[label] = Array.from(map[label]).sort();
        });
        return finalMap;
    }, [products]);
    const [currentLegalDoc, setCurrentLegalDoc] = useState(null); // { id: 'impressum', label: 'Impressum' }
    const [legalContent, setLegalContent] = useState('');
    const [footerTab, setFooterTab] = useState('social'); // 'social', 'legal', 'info', 'newsletter'

    // Variant Editor States
    const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
    const [editingVariantIndex, setEditingVariantIndex] = useState(null);
    const [variantFormData, setVariantFormData] = useState({
        name: '',
        sku: '',
        price: '',
        dealer_price: '',
        stock: '',
        description: '',
        images: [],
        attributes: [{ label: '', value: '' }]
    });

    const [quickAddLabel, setQuickAddLabel] = useState("");

    // Memoized stable config for variant editor - MUST NOT change reference on re-renders
    // Stable config for variant editor - Quill modules
    const variantModules = useMemo(() => ({
        toolbar: [
            ['bold', 'italic', 'underline'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link', 'clean']
        ],
    }), []);

    const openLegalEditor = (id, label) => {
        const doc = (settingsForm.legalDocs || []).find(d => d.id === id);
        setLegalContent(doc?.content || '');
        setCurrentLegalDoc({ id, label });
        setIsLegalEditorOpen(true);
    };

    const addLegalDoc = () => {
        const newId = `legal_${Date.now()}`;
        setSettingsForm(prev => ({
            ...prev,
            legalDocs: [
                ...(prev.legalDocs || []),
                { id: newId, label: 'Neuer Abschnitt', content: '' }
            ]
        }));
    };

    const removeLegalDoc = (id) => {
        setSettingsForm(prev => ({
            ...prev,
            legalDocs: (prev.legalDocs || []).filter(doc => doc.id !== id)
        }));
    };

    const addPaymentIcon = () => {
        const newId = `pay_${Date.now()}`;
        setSettingsForm(prev => ({
            ...prev,
            paymentIcons: [
                ...(prev.paymentIcons || []),
                { id: newId, name: '', url: '' }
            ]
        }));
    };

    const removePaymentIcon = (id) => {
        setSettingsForm(prev => ({
            ...prev,
            paymentIcons: (prev.paymentIcons || []).filter(icon => icon.id !== id)
        }));
    };

    const handlePaymentIconUpload = async (e, iconId) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsSubmitting(true);
        try {
            const fileExt = file.name.split('.').pop();
            const filePath = `shop/payment-${Date.now()}.${fileExt}`;

            const res = await fetch(`${process.env.REACT_APP_SUPABASE_URL}/storage/v1/object/product-images/${filePath}`, {
                method: 'POST',
                headers: {
                    'apikey': process.env.REACT_APP_SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`,
                    'Content-Type': file.type || 'application/octet-stream',
                    'x-upsert': 'false'
                },
                body: file
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({ message: `HTTP ${res.status}` }));
                throw new Error(errData.message || `Upload fail (${res.status})`);
            }

            const publicUrl = `${process.env.REACT_APP_SUPABASE_URL}/storage/v1/object/public/product-images/${filePath}`;

            setSettingsForm(prev => {
                const newIcons = (prev.paymentIcons || []).map(icon =>
                    icon.id === iconId ? { ...icon, url: publicUrl } : icon
                );
                return { ...prev, paymentIcons: newIcons };
            });
            toast.success('Bild erfolgreich hochgeladen');
        } catch (error) {
            console.error('PAYMENT ICON UPLOAD ERROR:', error);
            toast.error('Fehler beim Upload: ' + (error.message || 'Unbekannter Fehler'));
        } finally {
            setIsSubmitting(false);
        }
    };

    // Sync form with store on initial load ONLY (when shopSettings loads from Supabase)
    // We use a ref to track if we've done the initial sync, so we don't overwrite user edits
    const hasInitializedForm = React.useRef(false);
    useEffect(() => {
        if (shopSettings && !hasInitializedForm.current) {
            hasInitializedForm.current = true;

            const getInitialDocs = (settings) => {
                if (settings.legalDocs && Array.isArray(settings.legalDocs) && settings.legalDocs.length > 0) {
                    return settings.legalDocs;
                }
                return [
                    { id: 'impressum', label: settings.impressumLabel || 'Impressum', content: settings.impressum || '' },
                    { id: 'datenschutz', label: settings.datenschutzLabel || 'Datenschutz', content: settings.datenschutz || '' },
                    { id: 'agb', label: settings.agbLabel || 'AGB', content: settings.agb || '' },
                    { id: 'widerruf', label: settings.widerrufLabel || 'Widerrufsrecht', content: settings.widerruf || '' }
                ];
            };

            setSettingsForm({
                ...shopSettings,
                legalDocs: getInitialDocs(shopSettings),
                paymentIcons: shopSettings.paymentIcons || []
            });
        }
    }, [shopSettings]);

    const fetchVisitorStats = async () => {
        const { supabase } = await import('../supabase');
        if (!supabase) return;
        setVisitorsLoading(true);
        try {
            const today = new Date().toISOString().split('T')[0];

            // Get today's visits
            const { data: todayData } = await (supabase
                .from('daily_visits')
                .select('count')
                .eq('date', today)
                .single());

            // Get weekly data
            const last7DaysDate = new Date();
            last7DaysDate.setDate(last7DaysDate.getDate() - 7);
            const { data: weeklyData } = await (supabase
                .from('daily_visits')
                .select('*')
                .gte('date', last7DaysDate.toISOString().split('T')[0])
                .order('date', { ascending: true }));

            // For total visits, if we don't have a specific table, we sum up everything we have
            const { data: allData } = await (supabase
                .from('daily_visits')
                .select('count'));

            const totalSum = allData?.reduce((acc, curr) => acc + curr.count, 0) || 0;

            setVisitorStats({
                total: totalSum + 420, // 420 is a realistic base offset for historical traffic before tracking
                today: todayData?.count || 0,
                weekly: weeklyData || []
            });
        } catch (err) {
            console.warn("Visitor stats fetch failed", err);
        } finally {
            setVisitorsLoading(false);
        }
    };

    const fetchOnlineUsers = async () => {
        if (!supabase) return;
        setOnlineLoading(true);
        try {
            // Get users active in the last 15 minutes
            const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
            const { data } = await supabase
                .from('online_presence')
                .select('*')
                .gte('last_activity', fifteenMinsAgo)
                .order('last_activity', { ascending: false });

            setOnlineUsers(data || []);

            // Sync selected user details if they are still active - but DON'T auto-close if not found
            if (activeTab === 'Statistiken' && statsTab === 'online' && selectedOnlineUser) {
                const refreshed = data.find(u => u.session_id === selectedOnlineUser.session_id);
                if (refreshed) setSelectedOnlineUser(refreshed);
                // Removed the 'else' that set it to null, so the panel stays open with last known data
            }
        } catch (err) {
            console.warn("Online users fetch failed", err);
        } finally {
            setOnlineLoading(false);
        }
    };

    useEffect(() => {
        if (activeTabKey.startsWith('Statistiken-')) {
            const sub = activeTabKey.split('-')[1]?.toLowerCase();
            if (sub) setStatsTab(sub);
        }
    }, [activeTabKey]);

    useEffect(() => {
        if (activeTab === 'Artikelstatistik') setStatsTab('artikel');
        if (activeTab === 'Umsatzstatistik') setStatsTab('umsatz');
        if (activeTab === 'Kundenstatistik') setStatsTab('kunden');
        if (activeTab === 'Wer ist online?') setStatsTab('online');
    }, [activeTab]);

    useEffect(() => {
        let interval;
        if (activeTab === 'Statistiken' || activeTabKey.startsWith('Statistiken-')) {
            fetchVisitorStats();
            if (statsTab === 'online') {
                fetchOnlineUsers();
                interval = setInterval(fetchOnlineUsers, 10000); // refresh every 10s
            }
        }
        return () => clearInterval(interval);
    }, [activeTab, statsTab, activeTabKey]);

    // Instant Preview for Primary Color
    useEffect(() => {
        let styleTag = document.getElementById('brand-styles');
        if (!styleTag) return;

        const applyColor = (color) => {
            styleTag.innerHTML = `
                :root { --brand-primary: ${color}; }
                .text-red-600 { color: ${color} !important; }
                .bg-red-600 { background-color: ${color} !important; }
                .border-red-600 { border-color: ${color} !important; }
                .hover\\:bg-red-700:hover { background-color: ${color} !important; filter: brightness(0.9); }
                .hover\\:text-red-600:hover { color: ${color} !important; }
                .group-hover\\:text-red-600:hover { color: ${color} !important; }
                .focus-within\\:text-red-600:focus-within { color: ${color} !important; }
                .focus\\:ring-red-600:focus { --tw-ring-color: ${color}55 !important; }
                .bg-red-50 { background-color: ${color}10 !important; }
                .focus\\:border-red-600:focus { border-color: ${color} !important; }
                .accent-red-600 { accent-color: ${color} !important; }
                .from-red-600 { --tw-gradient-from: ${color} !important; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, ${color}00) !important; }
                .to-red-800 { --tw-gradient-to: ${color} !important; }
                ::selection { background-color: ${color}33; }
            `;
        };

        if (activeTab === 'Einstellungen' && settingsForm?.primaryColor) {
            applyColor(settingsForm.primaryColor);
        } else if (shopSettings?.primaryColor) {
            applyColor(shopSettings.primaryColor);
        }

        return () => {
            if (shopSettings?.primaryColor) {
                applyColor(shopSettings.primaryColor);
            }
        };
    }, [activeTab, settingsForm?.primaryColor, shopSettings?.primaryColor]);

    useEffect(() => {
        setShippingRatesForm(shippingRates || []);
    }, [shippingRates]);

    const handleSaveShippingRates = async () => {
        setIsSavingRates(true);
        const tid = toast.loading('Kargo ücretleri kaydediliyor...');

        try {
            const baseUrl = 'https://hhnrosczgggxelnbrhlk.supabase.co';
            const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhobnJvc2N6Z2dneGVsbmJyaGxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1MDM5MDEsImV4cCI6MjA4NjA3OTkwMX0.1U1UNpiwBUPCSiBRlg7r2KayQodJfTWULqO7xgCUq_s';

            const { data: sessionData } = await supabase.auth.getSession();
            const sessionToken = sessionData?.session?.access_token || anonKey;

            if (!baseUrl || !anonKey) throw new Error('API Konfiguration fehlt');

            const headers = {
                'apikey': anonKey,
                'Authorization': `Bearer ${sessionToken}`,
                'Content-Type': 'application/json',
                'Prefer': 'resolution=merge-duplicates'
            };

            // Prepare all payloads for bulk upsert
            const payloads = shippingRatesForm
                .filter(rate => rate.country_code && rate.country_code.trim().length > 0)
                .map(rate => {
                    const payload = {
                        country_code: rate.country_code.trim().toUpperCase(),
                        country_name: rate.country_name,
                        price: Number(rate.price?.toString().replace(',', '.')) || 0,
                        free_shipping_threshold: rate.free_shipping_threshold ? Number(rate.free_shipping_threshold.toString().replace(',', '.')) : null,
                        delivery_time: rate.delivery_time,
                        is_active: rate.is_active
                    };

                    const isTempId = rate.id && rate.id.toString().startsWith('temp_');
                    if (rate.id && !isTempId) {
                        payload.id = rate.id;
                    }
                    return payload;
                });

            if (payloads.length === 0) {
                toast.dismiss(tid);
                setIsSavingRates(false);
                return;
            }

            // Perform single bulk upsert request
            const res = await fetch(`${baseUrl}/rest/v1/shipping_rates?on_conflict=country_code`, {
                method: 'POST',
                headers,
                body: JSON.stringify(payloads)
            });

            if (!res.ok) {
                const errText = await res.text();
                console.error('Bulk save failed:', errText);
                throw new Error('Fehler beim Speichern der Versandkosten');
            }

            // Reload from DB to keep frontend in sync
            const fetchRes = await fetch(`${baseUrl}/rest/v1/shipping_rates?order=country_name.asc`, {
                headers: {
                    'apikey': anonKey,
                    'Authorization': `Bearer ${sessionToken}`
                }
            });

            if (!fetchRes.ok) throw new Error('Konnte neue Daten nicht laden.');
            const data = await fetchRes.json();

            if (data) {
                setShippingRates(data);
                localStorage.setItem('cached_shipping_rates', JSON.stringify(data));
                setShippingRatesForm(data);
            }
            toast.success('Länder-Versandkosten wurden erfolgreich gespeichert ✓', { id: tid });
        } catch (error) {
            console.error('❌ Error saving shipping rates:', error);
            toast.error('Speichern fehlgeschlagen: ' + (error.message || 'Unbekannter Fehler'), { id: tid });
        } finally {
            setIsSavingRates(false);
        }
    };

    const deleteShippingRate = async (id, index) => {
        if (!window.confirm('Versandland wirklich löschen?')) return;
        if (!supabase) return;

        try {
            if (id && id.toString().length > 10) {
                await supabase.from('shipping_rates').delete().eq('id', id);
            }

            const newForm = shippingRatesForm.filter((_, i) => i !== index);
            setShippingRatesForm(newForm);

            // Update global context
            const { data } = await supabase.from('shipping_rates').select('*').order('country_name', { ascending: true });
            if (data) {
                setShippingRates(data);
                localStorage.setItem('cached_shipping_rates', JSON.stringify(data));
            }

            toast.success('Land gelöscht.');
        } catch (error) {
            console.error('Error deleting shipping rate', error);
            toast.error('Fehler beim Löschen.');
        }
    };

    const handleSaveSettings = async () => {
        if (isSubmitting) return;

        setIsSubmitting(true);
        const tid = toast.loading('Einstellungen werden gespeichert...');

        try {
            // Create a clean sync object with all needed fields
            const finalPayload = {
                ...shopSettings, // Keep existing ones we might not be editing
                ...settingsForm, // Overwrite with current form state
                updated_at: new Date().toISOString()
            };

            console.log("💾 [ADMIN] Saving Full Settings Payload:", {
                footerDescription: finalPayload.footerDescription,
                facebookUrl: finalPayload.facebookUrl,
                legalDocsCount: finalPayload.legalDocs?.length
            });

            await updateShopSettings(finalPayload);
            
            toast.success('Shop-Einstellungen erfolgreich gespeichert ✓', { id: tid });
            setLastSaveTimestamp(Date.now());
            console.log("✅ [ADMIN] Global Save Complete.");
        } catch (err) {
            console.error("❌ [ADMIN] Global Save Error:", err);
            toast.error('Fehler beim Speichern: ' + (err.message || 'Verbindungsfehler'), { id: tid });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLogoUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsSubmitting(true);
        try {
            const fileExt = file.name.split('.').pop();
            const filePath = `shop/logo-${Date.now()}.${fileExt}`;

            const res = await fetch(`${process.env.REACT_APP_SUPABASE_URL}/storage/v1/object/product-images/${filePath}`, {
                method: 'POST',
                headers: {
                    'apikey': process.env.REACT_APP_SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`,
                    'Content-Type': file.type || 'application/octet-stream',
                    'x-upsert': 'false'
                },
                body: file
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({ message: `HTTP ${res.status}` }));
                throw new Error(errData.message || `Upload fail (${res.status})`);
            }

            const publicUrl = `${process.env.REACT_APP_SUPABASE_URL}/storage/v1/object/public/product-images/${filePath}`;

            setSettingsForm(prev => ({ ...prev, logoUrl: publicUrl }));
            toast.success('Logo erfolgreich hochgeladen');
        } catch (error) {
            console.error('FULL LOGO UPLOAD ERROR:', error);
            toast.error('Fehler beim Logo-Upload: ' + (error.message || 'Unbekannter Fehler'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleTabChange = (label) => {
        const key = Object.keys(pathMap).find(k => pathMap[k] === label);
        if (key) {
            navigate(`/admin/${key}`);
        } else if (label === 'Zur Website') {
            navigate('/');
        }
    };


    const handleCategoryFilterChange = (catIdOrObj) => {
        const catId = typeof catIdOrObj === 'object' ? catIdOrObj?.id : catIdOrObj;
        navigate(`/admin/Kategorien-Artikel?category=${catId || 'root'}`);
    };

    // Monitor URL for specific actions (like neu-artikel)
    useEffect(() => {
        if (subRoute === 'neu-artikel') {
            setEditingItem(null);
            const categoryIdFromUrl = searchParams.get('category_id');
            setFormData({
                name: '',
                price: '',
                dealer_price: '',
                description: '',
                category_id: categoryIdFromUrl || (categories[0]?.id || ''),
                category_ids: categoryIdFromUrl && categoryIdFromUrl !== 'root' ? [categoryIdFromUrl] : [],
                image: '',
                images: [],
                stock: '',
                warehouse_stock: '',
                sku: '',
                delivery_time: defaultDeliveryTime,
                shipping_cost: 0,
                shipping_method_name: 'Klein Paket',
                shipping_method_id: 'Klein Paket',
                is_active: true,
                variants: [],
                variant_title: '',
                attributes: lastUsedAttributeLabels.length > 0
                    ? lastUsedAttributeLabels.map(label => ({ label, value: '' }))
                    : [],
                art: lastUsedArt || '',
                tax_rate: defaultTaxRate || '19'
            });
            setProductEditorView('add');
        } else if (subRoute === 'edit-artikel') {
            const productId = searchParams.get('id');
            if (productId) {
                const prod = products.find(p => p.id.toString() === productId);
                if (prod) {
                    // Update editing item if it changed or if view is not 'edit'
                    if (!editingItem || editingItem.id !== prod.id || productEditorView !== 'edit') {
                        setEditingItem(prod);
                        setFormData({
                            name: prod.name,
                            price: prod.price?.toString().replace('.', ','),
                            dealer_price: prod.dealer_price?.toString().replace('.', ',') || '',
                            description: prod.description,
                            category_id: prod.category_id,
                            category_ids: prod.category_ids || (prod.category_id ? [prod.category_id] : []),
                            image: prod.image,
                            images: prod.images || (prod.image ? [prod.image] : []),
                            stock: prod.stock || '',
                            warehouse_stock: prod.warehouse_stock || '',
                            sku: prod.sku || '',
                            manufacturer_id: prod.manufacturer_id || '',
                            delivery_time: prod.delivery_time || defaultDeliveryTime,
                            shipping_cost: prod.shipping_cost?.toString().replace('.', ','),
                            shipping_method_name: prod.shipping_method_name || '',
                            shipping_method_id: prod.shipping_method_id || null,
                            is_active: prod.is_active !== undefined ? prod.is_active : true,
                            badge: prod.badge || null,
                            badge_type: prod.badge_type || 'default',
                            variants: (prod.variants || []).map(v => ({
                                ...v,
                                price: v.price?.toString().replace('.', ','),
                                dealer_price: v.dealer_price?.toString().replace('.', ',') || '',
                                stock: v.stock || 0,
                                attributes: v.attributes || (v.name ? [{ label: '', value: v.name }] : [{ label: '', value: '' }]),
                                sku: v.sku || '',
                                description: v.description || '',
                                images: Array.isArray(v.images) ? v.images : (v.image ? [v.image] : [])
                            })),
                            variant_title: prod.variant_title || '',
                            attributes: Array.isArray(prod.attributes) ? prod.attributes : [],
                            art: prod.art || '',
                            tax_rate: prod.tax_rate ?? lastUsedMwst ?? '',
                            discount_price: prod.discount_price?.toString().replace('.', ',') || '',
                            discount_expiry: prod.discount_expiry ? prod.discount_expiry.split('T')[0] : ''
                        });
                        setProductEditorView('edit');

                        const cat = flatCategories.find(c => c.id === prod.category_id);
                        if (cat) setSelectedCategoryDetail(cat);
                    }
                }
            }
        } else if (subRoute === 'neu-kategorie') {
            const parentIdFromUrl = searchParams.get('parent_id');
            setEditingItem(null);
            setFormData({
                name: '',
                icon: '📁',
                parent_id: parentIdFromUrl || null,
                is_active: true,
                description: '',
                banner_url: '',
                image_url: '',
                slug: '',
                sort_order: 0,
                banner_position: 'center'
            });
            setCategoryEditorView('add');
        } else if (subRoute === 'edit-kategorie') {
            const catId = searchParams.get('id');
            if (catId) {
                const cat = flatCategories.find(c => c.id.toString() === catId);
                if (cat) {
                    if (!editingItem || editingItem.id !== cat.id || categoryEditorView !== 'edit') {
                        setEditingItem(cat);
                        setFormData({
                            name: cat.name || '',
                            icon: cat.icon || '📁',
                            parent_id: cat.parent_id || null,
                            is_active: cat.is_active !== undefined ? cat.is_active : true,
                            description: cat.description || '',
                            banner_url: cat.banner_url || '',
                            image_url: cat.image_url || '',
                            slug: cat.slug || '',
                            sort_order: cat.sort_order || 0,
                            banner_position: cat.banner_position || 'center',
                            badge: cat.badge || null,
                            badge_type: cat.badge_type || 'default'
                        });
                        setCategoryEditorView('edit');

                        if (!selectedCategoryDetail || selectedCategoryDetail.id !== cat.id) {
                            setSelectedCategoryDetail(cat);
                        }
                    }
                }
            }
        } else if (!subRoute) {
            setProductEditorView(null);
            setCategoryEditorView(null);

            // Sync category filter from URL if present
            const catIdFromUrl = searchParams.get('category');
            if (catIdFromUrl) {
                if (catIdFromUrl === 'root' || catIdFromUrl === 'all') {
                    if (selectedCategoryDetail !== null) setSelectedCategoryDetail(null);
                } else if (catIdFromUrl === 'uncategorized') {
                    if (selectedCategoryDetail?.id !== 'uncategorized') {
                        setSelectedCategoryDetail({ id: 'uncategorized', name: 'Sonstige' });
                    }
                } else {
                    const cat = flatCategories.find(c => c.id === catIdFromUrl);
                    if (cat && (!selectedCategoryDetail || selectedCategoryDetail.id !== cat.id)) {
                        setSelectedCategoryDetail(cat);
                    }
                }
            }
        }
    }, [subRoute, searchParams, categories, products, flatCategories, defaultDeliveryTime]);

    useEffect(() => {
        setCurrentPage(1);
    }, [categoryFilter]);

    const openProductAddPage = (categoryId = null) => {
        const currentPath = encodeURIComponent(location.pathname + location.search);
        const currentCatId = categoryId || selectedCategoryDetail?.id || searchParams.get('category') || 'root';
        const url = `/admin/Kategorien-Artikel/neu-artikel?category_id=${currentCatId}&return_url=${currentPath}&return_cat=${currentCatId}`;
        navigate(url);
    };

    const openCategoryAddPage = (parentId = null) => {
        const currentPath = encodeURIComponent(location.pathname + location.search);
        const currentCatId = selectedCategoryDetail?.id || searchParams.get('category') || 'root';
        const url = `/admin/Kategorien-Artikel/neu-kategorie?parent_id=${parentId}&return_url=${currentPath}&return_cat=${currentCatId}`;
        navigate(url);
    };

    const closeEditor = () => {
        const returnUrl = searchParams.get('return_url');
        const returnCat = searchParams.get('return_cat') || searchParams.get('category');

        setProductEditorView(null);
        setCategoryEditorView(null);

        if (returnUrl) {
            navigate(returnUrl);
        } else if (returnCat && returnCat !== 'all' && returnCat !== 'root') {
            navigate(`/admin/Kategorien-Artikel?category=${returnCat}`);
        } else {
            navigate('/admin/Kategorien-Artikel');
        }
    };

    const toggleCategoryExpand = (catId) => {
        setExpandedCategories(prev => ({
            ...prev,
            [catId]: !prev[catId]
        }));
    };

    const menuItems = [
        { id: 'dashboard', label: 'Übersicht', icon: LayoutDashboard },
        { id: 'orders', label: 'Bestellungen', icon: ShoppingCart, badge: orders.length.toString() },
        { id: 'invoices', label: 'Rechnungen', icon: FileText },
        { id: 'customers', label: 'Kunden', icon: Users },
        { id: 'products', label: 'Kategorien / Artikel', icon: Package },
        { id: 'warehouse', label: 'Depo / Inventur', icon: Warehouse },
        { id: 'manufacturers', label: 'Hersteller', icon: Tag },
        { id: 'modules', label: 'Module', icon: Box },
        { id: 'statistics', label: 'Statistiken', icon: BarChart2 },
        { id: 'stats_artikel', label: 'Artikelstatistik', icon: Package, isSubItem: true },
        { id: 'stats_umsatz', label: 'Umsatzstatistik', icon: BarChart2, isSubItem: true },
        { id: 'stats_kunden', label: 'Kundenstatistik', icon: Users, isSubItem: true },
        { id: 'stats_online', label: 'Wer ist online?', icon: Globe, isSubItem: true },
        { id: 'settings', label: 'Einstellungen', icon: Settings },
        { id: 'home_settings', label: 'Startseiten-Einstellungen', icon: ImageIcon, isSubItem: true },
        { id: 'shipping_settings', label: 'Versand-Einstellungen', icon: Truck, isSubItem: true },
        { id: 'footer_settings', label: 'Inhalt & Rechtliches', icon: Scroll, isSubItem: true },
        { id: 'back_to_site', label: 'Zur Website', icon: ExternalLink, action: () => navigate('/') },
    ];

    useEffect(() => {
        fetchOrders();
        fetchCustomers();
    }, []);

    const fetchOrders = async () => {
        // Only show loading if we have no cached data
        if (orders.length === 0) setOrdersLoading(true);
        try {
            // Optimized fetch: We don't always need ALL order items and ALL product details for the list
            // But for now, keeping it consistent but adding a limit or caching the main list
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setOrders(data || []);
            localStorage.setItem('cached_admin_orders', JSON.stringify(data || []));
        } catch (error) {
            console.error('Error fetching orders:', error.message);
        } finally {
            setOrdersLoading(false);
        }
    };

    const handleViewOrder = async (order) => {
        setSelectedOrder(order);
        setOrderCustomer(null); // Reset
        setStatusEdit(order.status);
        setShippingCarrier(order.shipping_carrier || 'dhl');
        setInvoiceNotes(shopSettings?.defaultInvoiceNotes || ''); // Reset invoice notes to default
        setIsInvoiceStorniert(order.status === 'storniert'); // Set storno based on status
        setIsSideDetailOpen(true);
        setIsOrderModalOpen(false);

        try {
            // Fetch order items
            const { data: items, error: itemsError } = await supabase
                .from('order_items')
                .select('*, products(*)')
                .eq('order_id', order.id);
            if (itemsError) throw itemsError;
            setOrderItems(items || []);

            // Fetch customer details
            const { data: customer, error: custError } = await supabase
                .from('customers')
                .select('*')
                .eq('email', order.customer_email)
                .single();

            if (!custError && customer) {
                setOrderCustomer(customer);
            }
        } catch (error) {
            console.error('Error fetching order details:', error);
            toast.error('Sipariş detayları tam yüklenemedi.');
        }
    };

    const updateOrderStatus = async (status, trackingNumber = null, carrier = null) => {
        setIsSubmitting(true);
        try {
            const updateData = { status };
            if (trackingNumber !== null) updateData.tracking_number = trackingNumber;
            if (carrier !== null) updateData.shipping_carrier = carrier;

            const { data: updatedRows, error } = await supabase
                .from('orders')
                .update(updateData)
                .eq('id', selectedOrder.id)
                .select();

            if (error) throw error;

            if (!updatedRows || updatedRows.length === 0) {
                throw new Error('Keine Berechtigung zum Aktualisieren (RLS) oder ID nicht gefunden.');
            }

            toast.success('Bestellstatus aktualisiert.');

            // 1. Refresh background data
            fetchOrders();

            // 2. Update local state immediately for both the detail view and the main table
            const updatedOrder = { ...selectedOrder, ...updateData };
            setSelectedOrder(updatedOrder);
            setOrders(prev => prev.map(o => o.id === selectedOrder.id ? updatedOrder : o));

        } catch (error) {
            console.error('Error updating order:', error);
            toast.error('Aktualisierung fehlgeschlagen: ' + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePrintInvoice = () => {
        if (!selectedOrder) return;

        const printWindow = window.open('', '_blank');
        const orderDate = new Date(selectedOrder.created_at).toLocaleDateString('de-DE');
        const invoiceNumber = selectedOrder.invoice_number ? `RE-${selectedOrder.invoice_number}` : `RE-${selectedOrder.id.slice(0, 8).toUpperCase()}`;

        const totalAmount = Number(selectedOrder.total_amount);
        const subtotalWithVat = orderItems.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
        const shipping = Math.max(0, totalAmount - subtotalWithVat);

        // MwSt Berechnung (19% inkludiert)
        const vatRate = 0.19;
        const netTotal = totalAmount / (1 + vatRate);
        const vatAmount = totalAmount - netTotal;

        const formatCurrency = (val) => Number(val).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        const html = `
    < html >
                <head>
                    <title>RECHNUNG ${invoiceNumber}</title>
                    <style>
                        body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #333; position: relative; line-height: 1.5; font-size: 12px; }
                        .header { display: flex; justify-content: space-between; margin-bottom: 50px; }
                        .logo { font-size: 28px; font-weight: 900; color: #dc2626; letter-spacing: -1px; }
                        .info-grid { display: flex; justify-content: space-between; gap: 40px; margin-bottom: 40px; align-items: flex-start; }
                        .info-grid > div { flex: 1; }
                        .info-grid p { font-size: 11px; margin: 3px 0 !important; }
                        .section-title { font-size: 10px; font-weight: 800; color: #000; text-transform: uppercase; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-bottom: 10px; }
                        .variant-badge { font-size: 10px; color: #000; font-weight: 800; text-transform: uppercase; margin-top: 4px; border-left: 3px solid #dc2626; padding-left: 5px; }
                        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                        th { text-align: left; background: #fcfcfc; padding: 10px; font-size: 11px; text-transform: uppercase; border-bottom: 2px solid #333; }
                        td { padding: 10px; border-bottom: 1px solid #eee; font-size: 12px; }
                        .totals { margin-left: auto; width: 300px; }
                        .total-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 11px; }
                        .grand-total { font-weight: 900; font-size: 15px; border-top: 2px solid #333; margin-top: 10px; padding-top: 10px; }
                        .notes { margin-top: 30px; padding: 20px; background: #f9f9f9; border-left: 4px solid #dc2626; font-size: 12px; }
                        .storno-badge { position: absolute; transform: rotate(-35deg); font-size: 120px; color: rgba(220, 38, 38, 0.3); font-weight: 900; border: 15px solid rgba(220, 38, 38, 0.3); padding: 30px; top: 300px; left: 100px; pointer-events: none; z-index: 100; text-transform: uppercase; }
                        footer { position: absolute; bottom: 40px; left: 40px; right: 40px; border-top: 1px solid #eee; padding-top: 15px; display: flex; justify-content: space-between; align-items: flex-start; font-size: 10px; color: #555; font-weight: bold; line-height: 1.4; }
                        footer > div { flex: 1; }
                        @media print { footer { position: fixed; bottom: 20px; } }
                    </style>
                </head>
                <body>
                    ${isInvoiceStorniert ? '<div class="storno-badge">STORNIERT</div>' : ''}
                    <div class="header">
                        <div>
                            ${shopSettings?.logoUrl
                ? `<img src="${shopSettings.logoUrl}" style="max-height: 60px; max-width: 250px; object-fit: contain; margin-bottom: 10px;" />`
                : `<div class="logo">${shopSettings?.shopName || 'ELECTRIVE'}</div>`
            }
                            <div style="font-size: 11px; color: #555; line-height: 1.4; margin-top: 5px;">
                                <strong>${shopSettings?.companyName || shopSettings?.shopName || 'ELECTRIVE GmbH'}</strong><br/>
                                ${shopSettings?.companyStreet || 'Musterweg 12'}<br/>
                                ${shopSettings?.companyZip || '72574'} ${shopSettings?.companyCity || 'Bad Urach'}<br/>
                                ${shopSettings?.companyCountry || 'DEUTSCHLAND'}
                            </div>
                        </div>
                        <div style="text-align: right">
                            <h1 style="margin: 0; color: #dc2626; font-size: 36px; font-weight: 900; letter-spacing: -1px;">RECHNUNG</h1>
                            <p style="margin: 5px 0; font-size: 14px; font-weight: bold;">Nr.: ${invoiceNumber}</p>
                            <p style="margin: 5px 0; font-weight: bold; color: #000;">Datum: ${orderDate}</p>
                        </div>
                    </div>

                    <div class="info-grid">
                        <div>
                            <div class="section-title">Rechnungsempfänger</div>
                            <p style="margin: 0"><strong>${orderCustomer ? (orderCustomer.first_name ? `${orderCustomer.first_name} ${orderCustomer.last_name}` : orderCustomer.name) : selectedOrder.customer_name}</strong></p>
                            <p style="margin: 5px 0">${orderCustomer?.address_street || selectedOrder.street || '---'}</p>
                            <p style="margin: 5px 0">${orderCustomer?.address_zip || selectedOrder.zip} ${orderCustomer?.address_city || selectedOrder.city}</p>
                            <p style="margin: 5px 0">${orderCustomer?.address_country || selectedOrder.country || 'Deutschland'}</p>
                        </div>
                        <div style="text-align: right">
                            <div class="section-title">Zahlungsinfo</div>
                            <p style="margin: 5px 0"><strong>${selectedOrder.payment_method === 'paypal' ? 'PayPal' : (selectedOrder.payment_method || 'Vorkasse / Überweisung').toUpperCase()}</strong></p>
                            <p style="margin: 5px 0">Bestell-Nr: #${selectedOrder.id.slice(0, 8).toUpperCase()}</p>
                        </div>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th>Pos</th>
                                <th>Beschreibung</th>
                                <th style="text-align: center">Menge</th>
                                <th style="text-align: right">Einzelpreis</th>
                                <th style="text-align: right">Gesamt</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${orderItems.map((item, index) => `
                                <tr>
                                    <td>${index + 1}</td>
                                    <td>
                                        <div style="font-weight: bold; margin-bottom: 2px;">${item.products?.name || 'Produkt'}</div>
                                        ${item.variant_name ? `<div class="variant-badge">${item.variant_name}</div>` : ''}
                                    </td>
                                    <td style="text-align: center">${item.quantity}</td>
                                    <td style="text-align: right">${formatCurrency(item.price)} €</td>
                                    <td style="text-align: right">${formatCurrency(Number(item.price) * item.quantity)} €</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>

                    <div class="totals">
                        <div class="total-row">
                            <span>Zwischensumme (Netto):</span>
                            <span>${formatCurrency(netTotal - (shipping / (1 + vatRate)))} €</span>
                        </div>
                        <div class="total-row">
                            <span>Versandkosten (Netto):</span>
                            <span>${formatCurrency(shipping / (1 + vatRate))} €</span>
                        </div>
                        <div class="total-row">
                            <span>zzgl. 19% MwSt.:</span>
                            <span>${formatCurrency(vatAmount)} €</span>
                        </div>
                        <div class="total-row grand-total">
                            <span>Gesamtbetrag (Brutto):</span>
                            <span>${formatCurrency(totalAmount)} €</span>
                        </div>
                    </div>

                    ${invoiceNotes ? `<div class="notes"><strong>Anmerkungen:</strong><br/>${invoiceNotes.replace(/\n/g, '<br/>')}</div>` : ''}

                    <div style="margin-top: 40px; font-size: 12px;">
                        <p>Vielen Dank für Ihren Auftrag! Bitte begleichen Sie den Rechnungsbetrag innerhalb von 7 Tagen.</p>
                    </div>

                    <footer>
                        <div style="text-align: left">
                            <p style="margin: 0; color: #333; font-weight: 900">${shopSettings?.companyName || shopSettings?.shopName || 'ELECTRIVE GmbH'}</p>
                            <p style="margin: 0">${shopSettings?.companyStreet || 'Musterweg 12'}</p>
                            <p style="margin: 0">${shopSettings?.companyZip || '72574'} ${shopSettings?.companyCity || 'Bad Urach'}</p>
                            <p style="margin: 0">${shopSettings?.owner ? `GF: ${shopSettings.owner}` : 'CEO: K. Aydin'} | ${shopSettings?.supportEmail || 'support@electrive.de'}</p>
                        </div>
                        <div style="text-align: right">
                            <p style="margin: 0">St.-Nr / USt-IdNr.: ${shopSettings?.taxNumber || shopSettings?.vatId || 'DE 123 456 789'}</p>
                            <p style="margin: 0">Bank: ${shopSettings?.bankName || 'Sparkasse'}</p>
                            <p style="margin: 0">IBAN: ${shopSettings?.iban || 'DE12 3456 ...'}</p>
                            <p style="margin: 0">BIC: ${shopSettings?.bic || '---'}</p>
                        </div>
                    </footer>

                    <script>
                        window.onload = function() { window.print(); }
                    </script>
                </body>
            </html >
    `;

        printWindow.document.write(html);
        printWindow.document.close();
    };

    const handleDownloadInvoice = async () => {
        if (!selectedOrder) return;
        const invoiceElement = document.getElementById('invoice-preview-content');
        if (!invoiceElement) return;

        setIsSubmitting(true);
        const toastId = toast.loading('PDF wird generiert...');

        try {
            const canvas = await html2canvas(invoiceElement, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                windowWidth: 700
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            const invoiceNumber = selectedOrder.invoice_number ? `RE-${selectedOrder.invoice_number}` : `RE-${selectedOrder.id.slice(0, 8).toUpperCase()}`;
            pdf.save(`${invoiceNumber}.pdf`);

            toast.success('PDF erfolgreich heruntergeladen', { id: toastId });
        } catch (error) {
            console.error('PDF generation error:', error);
            toast.error('PDF-Download fehlgeschlagen', { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    const fetchCustomers = async () => {
        if (!supabase) return;
        if (customers.length === 0) setCustomersLoading(true);
        try {
            const { data, error } = await supabase
                .from('customers')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            setCustomers(data || []);
            localStorage.setItem('cached_admin_customers', JSON.stringify(data || []));
        } catch (error) {
            console.error('Error fetching customers:', error.message);
        } finally {
            setCustomersLoading(false);
        }
    };

    // Product CRUD Handlers
    const handleDeleteProduct = async (id) => {
        if (!id) return;
        if (!window.confirm('Möchten Sie dieses Produkt wirklich löschen?')) return;

        const tid = toast.loading('Produkt wird gelöscht...');
        try {
            const baseUrl = 'https://hhnrosczgggxelnbrhlk.supabase.co';
            const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhobnJvc2N6Z2dneGVsbmJyaGxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1MDM5MDEsImV4cCI6MjA4NjA3OTkwMX0.1U1UNpiwBUPCSiBRlg7r2KayQodJfTWULqO7xgCUq_s';

            const { data: sessionData } = await supabase.auth.getSession();
            const sessionToken = sessionData?.session?.access_token || anonKey;

            if (!baseUrl || !anonKey) throw new Error('API Konfiguration fehlt');

            const headers = { 'apikey': anonKey, 'Authorization': `Bearer ${sessionToken}` };

            // Check if product is in any orders first
            const countRes = await fetch(`${baseUrl}/rest/v1/order_items?select=id&product_id=eq.${id}&limit=1`, { headers });
            const countData = await countRes.json();

            if (countData && countData.length > 0) {
                toast.error('Produkt kann nicht gelöscht werden, da es in Bestellungen enthalten ist. Bitte stattdessen deaktivieren.', { id: tid });
                return;
            }

            // 0. Clean up relationships (Join tables and child records)
            // product_category_relations
            await fetch(`${baseUrl}/rest/v1/product_category_relations?product_id=eq.${id}`, {
                method: 'DELETE', headers
            });

            // reviews
            await fetch(`${baseUrl}/rest/v1/reviews?product_id=eq.${id}`, {
                method: 'DELETE', headers
            });

            // favorites
            await fetch(`${baseUrl}/rest/v1/favorites?product_id=eq.${id}`, {
                method: 'DELETE', headers
            });

            // 1. Delete product
            const delRes = await fetch(`${baseUrl}/rest/v1/products?id=eq.${id}`, {
                method: 'DELETE', headers
            });

            if (!delRes.ok) {
                let errorData = null;
                try {
                    errorData = await delRes.json();
                } catch(e) { }
                
                if (errorData?.code === '23503') {
                    throw new Error('Dieses Produkt ist noch mit anderen Daten (z.B. Bestellungen) verknüpft ve silinemez.');
                }
                throw new Error(errorData?.message || `Löschen fehlgeschlagen (${delRes.status})`);
            }

            toast.success('Produkt erfolgreich gelöscht', { id: tid });

            // Local state update for immediate feedback
            setProducts(prev => prev.filter(p => p.id !== id));

            if (typeof refreshData === 'function') refreshData(true);
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Fehler beim Löschen: ' + error.message, { id: tid });
        }
    };

    const handleSaveProduct = async (e) => {
        if (e && typeof e.preventDefault === 'function') try { e.preventDefault(); } catch(err) {}

        if (isSubmitting) return;
        setIsSubmitting(true);
        const toastId = toast.loading("Wird gespeichert...");

        const parseCurrency = (val) => {
            if (val === undefined || val === null || val === '') return 0;
            const str = val.toString().trim();
            if (str.includes(',')) {
                const normalized = str.replace(/\./g, '').replace(',', '.');
                return parseFloat(normalized) || 0;
            }
            return parseFloat(str) || 0;
        };

        try {
            console.group("🚀 Kayıt İşlemi (Stable Fetch Mode)");
            
            const pName = cleanStr(formData.name);
            if (!pName) {
                toast.error('Bitte geben Sie einen Namen ein.', { id: toastId });
                setIsSubmitting(false);
                console.groupEnd();
                return;
            }

            const isUpdate = !!(editingItem && editingItem.id);
            const pSku = cleanStr(formData.sku);
            const savedId = editingItem?.id;

            const dataToSave = {
                name: pName,
                price: parseCurrency(formData.price),
                dealer_price: parseCurrency(formData.dealer_price),
                description: cleanHTML(formData.description),
                stock: parseInt(formData.stock) || 0,
                warehouse_stock: parseInt(formData.warehouse_stock) || 0,
                sku: pSku,
                image: cleanStr(formData.image),
                images: Array.isArray(formData.images) ? formData.images.map(img => cleanStr(img)) : [],
                manufacturer_id: (formData.manufacturer_id && formData.manufacturer_id !== 'none') ? formData.manufacturer_id : null,
                category_id: (formData.category_id && formData.category_id !== 'none') ? formData.category_id : null,
                delivery_time: cleanStr(formData.delivery_time, "ca. 3-4 Tage"),
                shipping_cost: parseCurrency(formData.shipping_cost),
                shipping_method_name: cleanStr(formData.shipping_method_name),
                shipping_method_id: (formData.shipping_method_id && String(formData.shipping_method_id).includes('-')) ? formData.shipping_method_id : null,
                is_active: formData.is_active !== false,
                badge: formData.badge || null,
                badge_type: formData.badge_type || 'default',
                variants: (formData.variants || []).map(v => ({
                    ...v,
                    price: parseCurrency(v.price),
                    dealer_price: parseCurrency(v.dealer_price),
                    stock: parseInt(v.stock) || 0,
                    description: cleanHTML(v.description)
                })),
                variant_title: cleanStr(formData.variant_title),
                attributes: Array.isArray(formData.attributes) ? formData.attributes.filter(a => a.label?.trim()) : [],
                art: cleanStr(formData.art),
                tax_rate: (formData.tax_rate !== '' && formData.tax_rate != null) ? parseFloat(formData.tax_rate) : null,
                discount_price: formData.discount_price ? parseCurrency(formData.discount_price) : null,
                discount_expiry: formData.discount_expiry || null
            };

            // 1. Get Auth Context - Using getSession with safety timeout
            toast.loading("Sitzung wird geprüft...", { id: toastId });
            console.log("🔑 Getting Auth Context...");
            
            let currentSession = null;
            try {
                const sessionRes = await promiseWithTimeout(supabase.auth.getSession(), 5000, "Auth Session");
                currentSession = sessionRes.data.session;
            } catch (err) {
                console.warn("⚠️ Auth Timeout/Error - attempting manual fallback", err);
                // Fallback to manual storage if getSession hangs
                try {
                    const storageKey = 'electrive-auth-token';
                    const sessionStr = localStorage.getItem(storageKey);
                    if (sessionStr) currentSession = JSON.parse(sessionStr);
                } catch (e) { }
            }
            
            const accessToken = currentSession?.access_token || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhobnJvc2N6Z2dneGVsbmJyaGxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1MDM5MDEsImV4cCI6MjA4NjA3OTkwMX0.1U1UNpiwBUPCSiBRlg7r2KayQodJfTWULqO7xgCUq_s';
            console.log("🎟️ Token retrieved.");

            // 2. Perform Save via Network-Stable Fetch
            const baseUrl = 'https://hhnrosczgggxelnbrhlk.supabase.co';
            const targetUrl = isUpdate 
                ? `${baseUrl}/rest/v1/products?id=eq.${savedId}`
                : `${baseUrl}/rest/v1/products`;

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s absolute timeout

            console.log(isUpdate ? "📝 Sending UPDATE request..." : "✨ Sending INSERT request...");
            
            toast.loading("Daten werden an den Server gesendet...", { id: toastId });
            const response = await promiseWithTimeout(fetch(targetUrl, {
                method: isUpdate ? 'PATCH' : 'POST',
                headers: {
                    'apikey': process.env.REACT_APP_SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                    'Prefer': isUpdate ? 'return=minimal' : 'return=representation'
                },
                body: JSON.stringify(dataToSave),
                signal: controller.signal
            }), 30000, "API Save Request");

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errData = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));
                throw new Error(errData.message || `API Error: ${response.status}`);
            }

            let finalId = savedId;
            let responseData = null;
            if (!isUpdate || !isUpdate) { // Always try to get response if possible, especially for INSERT
                 try {
                     responseData = await response.json();
                     if (!isUpdate && responseData?.[0]?.id) {
                         finalId = responseData[0].id;
                     }
                 } catch (e) { console.warn("Could not parse response JSON", e); }
            }

            // 3. Sync Categories (Using stable FETCH instead of Supabase client to avoid Locks)
            if (finalId) {
                console.log("🔗 Stable category sync for product:", finalId);
                try {
                    const syncHeaders = {
                        'apikey': process.env.REACT_APP_SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    };

                    // Delete existing relations
                    toast.loading("Kategorie-Verknüpfungen werden aktualisiert (Löschen)...", { id: toastId });
                    await promiseWithTimeout(fetch(`${baseUrl}/rest/v1/product_category_relations?product_id=eq.${finalId}`, {
                        method: 'DELETE',
                        headers: syncHeaders
                    }), 10000, "Category Clean Sync");

                    // Insert new relations
                    const cIds = formData.category_ids || (formData.category_id ? [formData.category_id] : []);
                    if (cIds.length > 0) {
                        toast.loading("Kategorie-Verknüpfungen werden aktualisiert (Hinzufügen)...", { id: toastId });
                        const relations = [...new Set(cIds)].map(catId => ({
                            product_id: finalId,
                            category_id: catId
                        }));
                        
                        await promiseWithTimeout(fetch(`${baseUrl}/rest/v1/product_category_relations`, {
                            method: 'POST',
                            headers: syncHeaders,
                            body: JSON.stringify(relations)
                        }), 10000, "Category Update Sync");
                    }
                } catch (catErr) { 
                    console.error("❌ Category sync failed:", catErr);
                    // Non-blocking but logged
                }
            }

            // Persistence
            if (formData.tax_rate != null) localStorage.setItem('last_used_mwst', String(formData.tax_rate).trim());

            // Capture final session/auth details for background sync
            const currentCategoryIds = formData.category_ids || (formData.category_id ? [formData.category_id] : []);

            // Success - Update local state immediately for instant feedback
            // IMPORTANT: Include category_ids explicitly because the 'products' table doesn't return them in the response
            if (isUpdate) {
                setProducts(prev => prev.map(p => p.id === finalId ? { 
                    ...p, 
                    ...dataToSave, 
                    id: finalId,
                    category_ids: currentCategoryIds 
                } : p));
            } else {
                // For new product, use the representation from server if available (to get ID/defaults)
                const serverData = Array.isArray(responseData) ? responseData[0] : (responseData || {});
                const newProd = { 
                    ...(serverData.id ? serverData : dataToSave),
                    id: finalId, // Ensure finalId is used as fallback
                    category_ids: currentCategoryIds 
                };
                setProducts(prev => [newProd, ...prev]);
            }

            toast.success('Produkt erfolgreich gespeichert ✓', { id: toastId });
            closeEditor();
            
            // Force a background sync to ensure all relations (categories etc.) are correct in the DB
            setTimeout(() => {
                if (typeof refreshData === 'function') refreshData(true);
            }, 800);

        } catch (error) {
            console.error("💥 Final Save Error:", error);
            const msg = error.name === 'AbortError' ? 'Timeout: Server antwortet nicht (30s)' : (error.message || "Unbekannter Fehler");
            toast.error("Speichern fehlgeschlagen: " + msg, { id: toastId });
        } finally {
            console.groupEnd();
            setIsSubmitting(false);
        }
    };

    // Category CRUD Handlers
    const reorderCategory = async (category, direction) => {
        const siblings = (category.parent_id
            ? flatCategories.filter(c => c.parent_id === category.parent_id)
            : flatCategories.filter(c => !c.parent_id))
            .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0) || a.name.localeCompare(b.name));

        const index = siblings.findIndex(c => c.id === category.id);
        if (direction === 'up' && index > 0) {
            const other = siblings[index - 1];
            await swapSortOrder(category, other);
        } else if (direction === 'down' && index < siblings.length - 1) {
            const other = siblings[index + 1];
            await swapSortOrder(category, other);
        }
    };

    const swapSortOrder = async (cat1, cat2) => {
        let order1 = cat1.sort_order || 0;
        let order2 = cat2.sort_order || 0;

        // If identical, we need to distinguish them
        if (order1 === order2) {
            order2 = order1 + 1;
        }

        try {
            await supabase.from('categories').update({ sort_order: order2 }).eq('id', cat1.id);
            await supabase.from('categories').update({ sort_order: order1 }).eq('id', cat2.id);
            toast.success('Reihenfolge aktualisiert');
            refreshData(true);
        } catch (error) {
            toast.error('Reihenfolge konnte nicht geändert werden');
        }
    };

    const handleDeleteCategory = async (id) => {
        if (!id) return;
        if (!window.confirm('Möchten Sie diese Kategorie wirklich löschen? Hinweis: Produkte in dieser Kategorie werden unkategorisiert.')) return;

        const tid = toast.loading('Kategorie wird gelöscht...');
        try {
            // 0. Join table ilişkilerini temizle
            await supabase.from('product_category_relations').delete().eq('category_id', id);

            // 1. Foreign Key kısıtlamalarını temizle: Ürünleri bu kategoriden çıkar
            await supabase.from('products').update({ category_id: null }).eq('category_id', id);

            // 2. Bu kategoriye bağlı alt kategorileri "ana kategori" (root) yap
            await supabase.from('categories').update({ parent_id: null }).eq('parent_id', id);

            const { error } = await supabase.from('categories').delete().eq('id', id);
            if (error) throw error;

            toast.success('Kategorie gelöscht', { id: tid });
            refreshData(true);

            // Editör açıksa kapat
            if (editingItem?.id === id) {
                closeEditor();
            }
        } catch (error) {
            console.error('Category delete error:', error);
            toast.error('Fehler: ' + error.message, { id: tid });
        }
    };

    const handleSaveCategory = async (e) => {
        if (e) e.preventDefault();

        if (!formData.name || formData.name.trim() === '') {
            toast.error('Bitte geben Sie einen Kategorienamen ein.');
            return;
        }

        setIsSubmitting(true);
        const tid = toast.loading(editingItem ? 'Kategorie wird aktualisiert...' : 'Neue Kategorie wird erstellt...');
        console.log("💾 Category Save Started... (REST/Robust Mode)");

        try {
            const finalSlug = (formData.slug && formData.slug.trim() !== '')
                ? formData.slug
                : slugify(formData.name);

            const catData = {
                name: formData.name.trim(),
                slug: finalSlug,
                icon: formData.icon || '📁',
                parent_id: (formData.parent_id && formData.parent_id !== 'none' && formData.parent_id !== 'null' && formData.parent_id.toString().includes('-'))
                    ? formData.parent_id
                    : null,
                description: cleanHTML(formData.description),
                banner_url: formData.banner_url || '',
                image_url: formData.image_url || '',
                is_active: formData.is_active !== undefined ? formData.is_active : true,
                sort_order: parseInt(formData.sort_order) || 0,
                banner_position: formData.banner_position || 'center',
                badge: formData.badge || null,
                badge_type: formData.badge_type || 'default'
            };

            // Use direct REST call for maximum reliability
            const baseUrl = process.env.REACT_APP_SUPABASE_URL;
            const anonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
            const isEdit = editingItem && editingItem.id;

            let url = `${baseUrl}/rest/v1/categories`;
            if (isEdit) url += `?id=eq.${editingItem.id}`;

            const response = await fetch(url, {
                method: isEdit ? 'PATCH' : 'POST',
                headers: {
                    'apikey': anonKey,
                    'Authorization': `Bearer ${anonKey}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify(catData)
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(errText || `HTTP_${response.status} `);
            }

            console.log("✅ Category Saved Successfully");
            toast.success(editingItem ? 'Kategorie erfolgreich aktualisiert ✓' : 'Kategorie erfolgreich erstellt ✓', { id: tid });

            if (catData.parent_id) {
                setExpandedCategories(prev => ({ ...prev, [catData.parent_id]: true }));
            }

            // Small delay to ensure DB catchup before refresh
            setTimeout(() => {
                closeEditor();
                if (typeof refreshData === 'function') refreshData(true);
            }, 600);

        } catch (error) {
            console.error("💥 Category Save Error:", error);
            const msg = error.message || "Bilinmeyen hata";

            if (msg.includes('categories_slug_key')) {
                toast.error('Dieser Slug (URL Link) wird bereits verwendet.', { id: tid });
            } else {
                toast.error('Speichern fehlgeschlagen: ' + msg, { id: tid });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // Manufacturer CRUD Handlers
    // fetchManufacturers now delegates to StoreContext refreshData
    const fetchManufacturers = () => refreshData(true);

    const handleSaveManufacturer = async () => {
        if (!manufacturerFormData.name) {
            toast.error('Bitte geben Sie einen Namen ein');
            return;
        }

        setIsSubmitting(true);
        const tid = toast.loading(editingItem ? 'Hersteller wird aktualisiert...' : 'Hersteller wird erstellt...');

        try {
            const mData = {
                name: manufacturerFormData.name,
                logo_url: manufacturerFormData.logo_url || null,
                banner_url: manufacturerFormData.banner_url || null,
                website: manufacturerFormData.website || null,
                address: manufacturerFormData.address || null,
                zip_code: manufacturerFormData.zip_code || null,
                city: manufacturerFormData.city || null,
                country: manufacturerFormData.country || null,
                description: cleanHTML(manufacturerFormData.description),
                banner_position: manufacturerFormData.banner_position || '50% 50%',
                is_active: manufacturerFormData.is_active !== undefined ? manufacturerFormData.is_active : true
            };

            const baseUrl = process.env.REACT_APP_SUPABASE_URL;
            const anonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
            const isEdit = editingItem && editingItem.id;

            // 1. Manually retrieve access token from storage to bypass library locks
            let accessToken = anonKey;
            try {
                const storedSession = localStorage.getItem('electrive-auth-token');
                if (storedSession) {
                    const parsed = JSON.parse(storedSession);
                    if (parsed && parsed.access_token) {
                        accessToken = parsed.access_token;
                    }
                }
            } catch (authErr) {
                console.warn("🔐 Could not read manual auth token, using anon key:", authErr);
            }

            let url = `${baseUrl}/rest/v1/manufacturers`;
            if (isEdit) url += `?id=eq.${editingItem.id}`;

            const response = await fetch(url, {
                method: isEdit ? 'PATCH' : 'POST',
                headers: {
                    'apikey': anonKey,
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation' // Return the row so we can get the ID for new ones
                },
                body: JSON.stringify(mData)
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(errText || `HTTP_${response.status} `);
            }

            // --- RESPONSE HANDLING ---
            let newId = isEdit ? editingItem.id : null;
            try {
                // Read response body safely
                const responseData = await response.json();
                const actualRow = Array.isArray(responseData) ? responseData[0] : responseData;
                if (actualRow && actualRow.id) {
                    newId = actualRow.id;
                }
            } catch (jsonErr) {
                if (!newId) newId = Math.random().toString(36).substring(7);
            }

            const updatedManufacturer = {
                ...mData,
                id: newId
            };

            // Update local state for immediate feedback
            if (isEdit) {
                setManufacturers(prev => (prev || []).map(m => m.id === (editingItem?.id || '') ? updatedManufacturer : m));
            } else {
                setManufacturers(prev => [...(prev || []), updatedManufacturer]);
            }

            toast.success(editingItem ? 'Hersteller başarıyla güncellendi ✓' : 'Yeni hersteller oluşturuldu ✓', { id: tid });

            setTimeout(() => {
                setIsManufacturerModalOpen(false);
                if (typeof refreshData === 'function') refreshData(true);
            }, 800);

        } catch (error) {
            console.error("💥 Manufacturer Save Error:", error);
            toast.error('Speichern fehlgeschlagen: ' + error.message, { id: tid });
        } finally {
            setIsSubmitting(false);
            setEditingItem(null);
        }
    };

    const handleDeleteManufacturer = async (id) => {
        if (!window.confirm('Möchten Sie diesen Hersteller wirklich löschen?')) return;

        try {
            const { error } = await supabase
                .from('manufacturers')
                .delete()
                .eq('id', id);

            if (error) throw error;

            toast.success('Hersteller gelöscht');
            refreshData(true); // Refresh all data from StoreContext
        } catch (error) {
            toast.error('Fehler beim Löschen: ' + error.message);
        }
    };

    const openProductModal = (product = null, fromWarehouse = false) => {
        const currentPath = encodeURIComponent(location.pathname + location.search);
        const currentCatId = selectedCategoryDetail?.id || searchParams.get('category') || 'root';

        if (product?.id) {
            navigate(`/admin/Kategorien-Artikel/edit-artikel?id=${product.id}&return_url=${currentPath}&return_cat=${currentCatId}`);
        } else {
            navigate(`/admin/Kategorien-Artikel/neu-artikel?return_url=${currentPath}&return_cat=${currentCatId}`);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedRowIds.length === 0) {
            toast.error('Bitte wählen Sie zuerst Elemente aus.');
            return;
        }

        if (!window.confirm(`${selectedRowIds.length} Elemente wirklich löschen?`)) return;

        const tid = toast.loading(`${selectedRowIds.length} Elemente werden gelöscht...`);
        let successCount = 0;
        let failCount = 0;

        try {
            for (const id of selectedRowIds) {
                try {
                    // Önce kategori mi yoksa ürün mü olduğunu anlamaya çalışalım
                    const isCat = flatCategories.some(c => c.id === id);
                    if (isCat) {
                        // Kategori Silme Mantığı (ForeignKey korumalı)
                        await supabase.from('products').update({ category_id: null }).eq('category_id', id);
                        await supabase.from('categories').update({ parent_id: null }).eq('parent_id', id);
                        const { error } = await supabase.from('categories').delete().eq('id', id);
                        if (error) throw error;
                    } else {
                        // Ürün Silme Mantığı
                        const { error } = await supabase.from('products').delete().eq('id', id);
                        if (error) throw error;
                    }
                    successCount++;
                } catch (err) {
                    console.error(`Bulk Delete Error (${id}):`, err);
                    failCount++;
                }
            }

            toast.success(`${successCount} Elemente erfolgreich gelöscht.${failCount > 0 ? ` (${failCount} Fehler)` : ''}`, { id: tid });
            setSelectedRowIds([]);
            refreshData(true);
        } catch (error) {
            toast.error('Bulk Delete fehlgeschlagen: ' + error.message, { id: tid });
        }
    };

    const openCategoryModal = (category = null) => {
        const currentPath = encodeURIComponent(location.pathname + location.search);
        const currentCatId = selectedCategoryDetail?.id || searchParams.get('category') || 'root';

        if (category?.id) {
            navigate(`/admin/Kategorien-Artikel/edit-kategorie?id=${category.id}&return_url=${currentPath}&return_cat=${currentCatId}`);
        } else {
            navigate(`/admin/Kategorien-Artikel/neu-kategorie?return_url=${currentPath}&return_cat=${currentCatId}`);
        }
    };

    const handleImageUpload = async (e, field = 'image') => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setIsUploading(true);
        console.log(`🖼️ Batch Upload Started: ${files.length} files for ${field}`);

        const uploadedUrls = [];
        const errors = [];

        try {
            for (const file of files) {
                try {
                    const fileExt = file.name.split('.').pop();
                    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
                    const filePath = `uploads/${fileName}`;

                    console.log(`📡 Uploading: ${file.name} -> ${filePath}`);

                    // RAW FETCH UPLOAD (Safari/Network Stability Mode)
                    const uploadPromise = async () => {
                        const baseUrl = 'https://hhnrosczgggxelnbrhlk.supabase.co';
                        const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhobnJvc2N6Z2dneGVsbmJyaGxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1MDM5MDEsImV4cCI6MjA4NjA3OTkwMX0.1U1UNpiwBUPCSiBRlg7r2KayQodJfTWULqO7xgCUq_s';
                        const url = `${baseUrl}/storage/v1/object/product-images/${filePath}`;

                        const res = await fetch(url, {
                            method: 'POST',
                            headers: {
                                'apikey': anonKey,
                                'Authorization': `Bearer ${anonKey}`,
                                'Content-Type': file.type || 'application/octet-stream',
                                'x-upsert': 'false'
                            },
                            body: file
                        });

                        if (!res.ok) {
                            const errData = await res.json().catch(() => ({ message: `HTTP ${res.status}` }));
                            throw new Error(errData.message || `Upload fail(${res.status})`);
                        }
                        return true;
                    };

                    // Timeout for the upload
                    const timeoutPromise = new Promise((_, reject) =>
                        setTimeout(() => reject(new Error('UPLOAD_TIMEOUT')), 60000)
                    );

                    await Promise.race([uploadPromise(), timeoutPromise]);

                    const publicUrl = `${process.env.REACT_APP_SUPABASE_URL}/storage/v1/object/public/product-images/${filePath}`;

                    console.log(`🔗 Success: ${publicUrl}`);
                    uploadedUrls.push(publicUrl);
                } catch (err) {
                    console.error(`💥 Unexpected error for ${file.name}: `, err);
                    errors.push(`${file.name}: ${err.message || 'Unbekannter Fehler'} `);
                }
            }

            if (uploadedUrls.length > 0) {
                if (field === 'images') {
                    setFormData(prev => ({
                        ...prev,
                        images: [...(prev.images || []), ...uploadedUrls],
                        image: prev.image || uploadedUrls[0]
                    }));
                } else {
                    setFormData(prev => ({ ...prev, [field]: uploadedUrls[0] }));
                }
                toast.success(`${uploadedUrls.length} von ${files.length} Bild(er) erfolgreich hochgeladen`);
            }

            if (errors.length > 0) {
                toast.error(`Einige Uploads sind fehlgeschlagen: \n${errors.slice(0, 2).join('\n')}${errors.length > 2 ? '...' : ''} `);
            }

        } catch (globalError) {
            console.error('💥 Global Upload Batch Error:', globalError);
            toast.error('Batch-Upload fehlgeschlagen: ' + globalError.message);
        } finally {
            setIsUploading(false);
            e.target.value = ''; // Reset input
        }
    };

    const openVariantModal = (variant = null, index = null) => {
        if (variant) {
            setVariantFormData({
                name: variant.name || '',
                sku: variant.sku || '',
                price: variant.price || '',
                dealer_price: variant.dealer_price || '',
                stock: variant.stock || '',
                description: variant.description || '',
                images: Array.isArray(variant.images) ? variant.images : (variant.image ? [variant.image] : []),
                attributes: variant.attributes || [{ label: '', value: '' }]
            });
            setEditingVariantIndex(index);
        } else {
            setVariantFormData({
                name: '',
                sku: '',
                price: '',
                dealer_price: '',
                stock: '',
                description: '',
                images: [],
                attributes: [{ label: '', value: '' }]
            });
            setEditingVariantIndex(null);
        }
        setIsVariantModalOpen(true);
    };

    const saveVariantModal = () => {
        const newVariants = [...(formData.variants || [])];
        const variantData = {
            ...variantFormData,
            // Ensure the concatenated name is updated based on attributes
            name: variantFormData.attributes
                .map(a => `${a.label ? a.label + ': ' : ''}${a.value}`)
                .filter(s => s.trim())
                .join(', ')
        };

        if (editingVariantIndex !== null) {
            newVariants[editingVariantIndex] = variantData;
        } else {
            newVariants.push(variantData);
        }

        setFormData({ ...formData, variants: newVariants });
        setIsVariantModalOpen(false);
    };

    const handleVariantImageUpload = async (e, variantIdx = null) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setIsUploading(true);
        const toastId = toast.loading(`${files.length} Bild(er) werden hochgeladen...`);

        try {
            const uploadedUrls = [];
            for (const file of files) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
                const filePath = `variants/${fileName}`;

                const baseUrl = process.env.REACT_APP_SUPABASE_URL;
                const anonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
                const url = `${baseUrl}/storage/v1/object/product-images/${filePath}`;

                const res = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'apikey': anonKey,
                        'Authorization': `Bearer ${anonKey}`,
                        'Content-Type': file.type || 'application/octet-stream'
                    },
                    body: file
                });

                if (!res.ok) {
                    throw new Error(`Upload fail(${res.status})`);
                }

                const publicUrl = `${baseUrl}/storage/v1/object/public/product-images/${filePath}`;
                uploadedUrls.push(publicUrl);
            }

            if (variantIdx !== null) {
                // Background update for a specific variant in the main list
                const newVariants = [...(formData.variants || [])];
                const currentImages = Array.isArray(newVariants[variantIdx].images) ? newVariants[variantIdx].images : (newVariants[variantIdx].image ? [newVariants[variantIdx].image] : []);
                newVariants[variantIdx] = {
                    ...newVariants[variantIdx],
                    images: [...currentImages, ...uploadedUrls],
                    image: uploadedUrls[0] // Set first as main image for compatibility
                };
                setFormData(prev => ({ ...prev, variants: newVariants }));
            } else {
                // Update the variant currently being edited in the modal
                setVariantFormData(prev => ({
                    ...prev,
                    images: [...(prev.images || []), ...uploadedUrls]
                }));
            }

            toast.success("Bild(er) erfolgreich hinzugefügt", { id: toastId });
        } catch (error) {
            console.error('Upload-Fehler:', error);
            toast.error('Upload-Fehler: ' + error.message, { id: toastId });
        } finally {
            setIsUploading(false);
        }
    };

    const handleSliderImageUpload = async (e, index) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `slider-${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
            const filePath = `slider/${fileName}`;
            // RAW FETCH UPLOAD (Safari/Network Stability Mode)
            const uploadUrl = `${process.env.REACT_APP_SUPABASE_URL}/storage/v1/object/product-images/${filePath}`;
            const res = await fetch(uploadUrl, {
                method: 'POST',
                headers: {
                    'apikey': process.env.REACT_APP_SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`,
                    'Content-Type': file.type || 'application/octet-stream',
                    'x-upsert': 'false'
                },
                body: file
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({ message: `HTTP ${res.status}` }));
                throw new Error(errData.message || `Upload fail(${res.status})`);
            }

            const publicUrl = `${process.env.REACT_APP_SUPABASE_URL}/storage/v1/object/public/product-images/${filePath}`;
            const newSlides = [...settingsForm.sliderImages];
            newSlides[index].image = publicUrl;
            setSettingsForm({ ...settingsForm, sliderImages: newSlides });
            toast.success('Slider-Bild erfolgreich hochgeladen ✓');
        } catch (error) {
            console.error('Error uploading slider image:', error);
            toast.error('Upload-Fehler: ' + error.message);
        } finally {
            setIsUploading(false);
        }
    };

    const handleManufacturerUpload = async (e, field) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
            const filePath = `manufacturers/${fileName}`;

            // 1. Get session token for storage upload
            const { data: { session: uploadSession } } = await supabase.auth.getSession();
            const accessToken = uploadSession?.access_token || process.env.REACT_APP_SUPABASE_ANON_KEY;
            
            if (!uploadSession) {
                console.warn("⚠️ No active session for file upload.");
            }

            // RAW FETCH UPLOAD (Safari/Network Stability Mode)
            const uploadUrl = `${process.env.REACT_APP_SUPABASE_URL}/storage/v1/object/product-images/${filePath}`;
            const res = await fetch(uploadUrl, {
                method: 'POST',
                headers: {
                    'apikey': process.env.REACT_APP_SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': file.type || 'application/octet-stream',
                    'x-upsert': 'false'
                },
                body: file
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({ message: `HTTP ${res.status}` }));
                throw new Error(errData.message || `Upload fail(${res.status})`);
            }

            const publicUrl = `${process.env.REACT_APP_SUPABASE_URL}/storage/v1/object/public/product-images/${filePath}`;

            setManufacturerFormData(prev => ({ ...prev, [field]: publicUrl }));
            toast.success('Bild erfolgreich hochgeladen');
        } catch (error) {
            console.error('Error uploading manufacturer image:', error);
            toast.error('Upload-Fehler: ' + error.message);
        } finally {
            setIsUploading(false);
        }
    };

    const downloadCSVTemplate = () => {
        const headers = ["name", "price", "description", "stock", "sku", "image", "images", "category_id", "manufacturer_id"];
        const sampleRow = ["Beispiel Produkt", "99.99", "Beschreibung des Produkts", "10", "SKU-001", "https://example.com/image.jpg", "https://example.com/img1.jpg, https://example.com/img2.jpg", "", ""];

        // Excel treats ; as separator in TR/DE regions. Adding BOM for encoding and sep=; for Excel.
        const csvContent = "sep=;\n" + [headers, sampleRow].map(row => row.join(";")).join("\n");
        const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "produkte_template.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleCSVExport = () => {
        if (!products || products.length === 0) {
            toast.error("Keine Produkte zum Exportieren gefunden.");
            return;
        }

        const headers = ["ID", "Name", "Preis", "SKU", "Lagerbestand", "Lagerbestand (Depo)", "Kategorie", "Hersteller", "Beschreibung", "Bild URL", "Bilder URLs", "Erstellt am"];

        const rows = products.map(p => {
            const category = flatCategories.find(c => c.id === p.category_id);
            const manufacturer = manufacturers.find(m => m.id === p.manufacturer_id);

            return [
                p.id,
                `"${(p.name || '').replace(/"/g, '""')}"`,
                p.price,
                `"${(p.sku || '').replace(/"/g, '""')}"`,
                p.stock || 0,
                p.warehouse_stock || 0,
                `"${((category?.name || '')).replace(/"/g, '""')}"`,
                `"${((manufacturer?.name || '')).replace(/"/g, '""')}"`,
                `"${(p.description || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`,
                `"${(p.image || '').replace(/"/g, '""')}"`,
                `"${(p.images || []).join(', ').replace(/"/g, '""')}"`,
                new Date(p.created_at).toLocaleDateString('de-DE')
            ];
        });

        const csvContent = "sep=;\n" + [headers, ...rows].map(row => row.join(";")).join("\n");
        const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `produkte_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Produktexport abgeschlossen.");
    };

    const handleCategoryExport = () => {
        if (!flatCategories || flatCategories.length === 0) {
            toast.error("Keine Kategorien zum Exportieren gefunden.");
            return;
        }

        const headers = ["ID", "Name", "Icon", "Parent ID", "Parent Name", "Slug", "Reihenfolge", "Aktiv", "Beschreibung", "Bild URL", "Banner URL"];

        const rows = flatCategories.map(c => {
            const parent = flatCategories.find(p => p.id === c.parent_id);

            return [
                c.id,
                `"${(c.name || '').replace(/"/g, '""')}"`,
                `"${(c.icon || '').replace(/"/g, '""')}"`,
                c.parent_id || '',
                `"${(parent?.name || '').replace(/"/g, '""')}"`,
                `"${(c.slug || '').replace(/"/g, '""')}"`,
                c.sort_order || 0,
                c.is_active ? 'Ja' : 'Nein',
                `"${(c.description || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`,
                `"${(c.image_url || '').replace(/"/g, '""')}"`,
                `"${(c.banner_url || '').replace(/"/g, '""')}"`
            ];
        });

        const csvContent = "sep=;\n" + [headers, ...rows].map(row => row.join(";")).join("\n");
        const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `kategorien_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Kategorienexport abgeschlossen.");
    };

    const handleCSVUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                await processCSVData(results.data);
            },
            error: (error) => {
                toast.error("Fehler beim Lesen der CSV: " + error.message);
            }
        });

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const processCSVData = async (data) => {
        if (!data || data.length === 0) {
            toast.error("CSV-Datei ist leer.");
            return;
        }

        setIsImporting(true);
        const productsToInsert = [];
        const toastId = toast.loading(`${data.length} Produkte werden verarbeitet...`);

        // Debug: Get headers of the first row to show in error message if needed
        const firstRowHeaders = Object.keys(data[0]);

        try {
            for (const row of data) {
                // Flexible mapping for common header names
                const name = row.name || row.Name || row.Titel || row.titel || row.Produktname || row.produktname || row['Ürün Adı'] || row['ürün adı'] || '';
                const priceStr = row.price || row.Price || row.Preis || row.preis || row.Fiyat || row.fiyat || '0';
                const desc = row.description || row.Description || row.Beschreibung || row.beschreibung || row.Açıklama || row.açıklama || '';
                const stockStr = row.stock || row.Stock || row.Lager || row.lager || row.Stok || row.stok || '0';
                const sku = row.sku || row.SKU || row.Artikelnummer || row.artikelnummer || '';
                const image = row.image || row.Image || row.Bild || row.bild || row.Resim || row.resim || '';
                const imagesStr = row.images || row.Images || row.Bilder || row.bilder || '';

                const productData = {
                    name: name.toString().trim(),
                    price: parseFloat(priceStr.toString().replace(',', '.')),
                    description: desc.toString().trim(),
                    stock: parseInt(stockStr.toString()) || 0,
                    sku: sku.toString().trim(),
                    image: image.toString().trim(),
                    images: imagesStr ? imagesStr.split(',').map(img => img.trim()) : (image ? [image.toString().trim()] : []),
                    category_id: row.category_id && row.category_id !== '' ? row.category_id : null,
                    manufacturer_id: row.manufacturer_id && row.manufacturer_id !== '' ? row.manufacturer_id : null
                };

                if (productData.name) {
                    productsToInsert.push(productData);
                }
            }

            if (productsToInsert.length === 0) {
                console.log("Headers found:", firstRowHeaders);
                toast.error(`Keine gültigen Produkte gefunden. Gefundene Spalten: ${firstRowHeaders.join(', ')}. Bitte stellen Sie sicher, dass Ihre CSV eine Spalte 'name' hat.`, { id: toastId, duration: 6000 });
                return;
            }

            const { data: insertedProducts, error } = await supabase
                .from('products')
                .insert(productsToInsert)
                .select();

            if (error) throw error;

            // Multi-Category Relation Management for imported products
            const allRelations = [];
            if (insertedProducts && insertedProducts.length > 0) {
                insertedProducts.forEach((prod, idx) => {
                    // Try to find the source row in the original data to get category_ids
                    // We assume productsToInsert and insertedProducts follow the same order
                    const sourceRow = data.find((row, rowIdx) => {
                        const name = row.name || row.Name || row.Titel || row.titel || row.Produktname || row.produktname || row['Ürün Adı'] || row['ürün adı'] || '';
                        return name.toString().trim() === prod.name;
                    });

                    if (sourceRow) {
                        const catIdsStr = sourceRow.category_ids || sourceRow.CategoryIds || sourceRow['kategori_idleri'] || '';
                        let ids = catIdsStr ? catIdsStr.toString().split(',').map(id => id.trim()).filter(Boolean) : [];

                        // Fallback to single category_id if it's not already in the list
                        if (prod.category_id && !ids.includes(prod.category_id)) {
                            ids.push(prod.category_id);
                        }

                        ids.forEach(catId => {
                            allRelations.push({
                                product_id: prod.id,
                                category_id: catId
                            });
                        });
                    }
                });

                if (allRelations.length > 0) {
                    await supabase.from('product_category_relations').insert(allRelations);
                }
            }

            toast.success(`${productsToInsert.length} Produkte erfolgreich importiert.`, { id: toastId });
            refreshData(true);
        } catch (error) {
            console.error('Import error:', error);
            toast.error("Importfehler: " + error.message, { id: toastId });
        } finally {
            setIsImporting(false);
        }
    };

    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total_amount), 0);

    const artikelStats = React.useMemo(() => {
        const soldMap = {};
        orders.forEach(order => {
            (order.order_items || []).forEach(item => {
                const pid = item.product_id;
                if (!soldMap[pid]) {
                    soldMap[pid] = {
                        id: pid,
                        name: item.products?.name || 'Unbekannt',
                        quantity: 0,
                        revenue: 0,
                        image: item.products?.image
                    };
                }
                soldMap[pid].quantity += item.quantity;
                soldMap[pid].revenue += Number(item.price) * item.quantity;
            });
        });

        const topSold = Object.values(soldMap).sort((a, b) => b.quantity - a.quantity);
        const topClicked = [...products].sort((a, b) => (b.views || 0) - (a.views || 0));

        return { topSold, topClicked };
    }, [orders, products]);

    const revenueStats = React.useMemo(() => {
        const dailyData = [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toLocaleDateString('de-DE');
            const dayOrders = orders.filter(o => new Date(o.created_at).toLocaleDateString('de-DE') === dateStr);
            return {
                day: d.toLocaleDateString('de-DE', { weekday: 'short' }),
                date: dateStr,
                revenue: dayOrders.reduce((sum, o) => sum + Number(o.total_amount), 0),
                count: dayOrders.length
            };
        }).reverse();

        return dailyData;
    }, [orders]);

    const slugify = (text) => {
        return text
            .toString()
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')     // Replace spaces with -
            .replace(/[^\w\-]+/g, '') // Remove all non-word chars
            .replace(/\-\-+/g, '-');  // Replace multiple - with single -
    };

    const renderOverview = () => (
        <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="rounded-lg">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-gray-500 text-sm font-medium">Gesamtumsatz</span>
                            <div className="w-8 h-8 bg-green-100 text-green-600 rounded-md flex items-center justify-center">
                                <BarChart2 className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-gray-900 mb-1">
                            {loading || ordersLoading ? '...' : `${totalRevenue.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`}
                        </div>
                        <div className="text-xs text-green-600 flex items-center gap-1">
                            <ArrowUp className="w-3 h-3" />
                            <span>+12.5%</span>
                            <span className="text-gray-400">zum Vormonat</span>
                        </div>
                    </CardContent>
                </Card>
                <Card className="rounded-lg">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-gray-500 text-sm font-medium">Bestellungen</span>
                            <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-md flex items-center justify-center">
                                <ShoppingCart className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-gray-900 mb-1">
                            {ordersLoading ? '...' : orders.length}
                        </div>
                        <div className="text-xs text-blue-600 flex items-center gap-1">
                            <PlusCircle className="w-3 h-3" />
                            <span>{orders.filter(o => new Date(o.created_at).toDateString() === new Date().toDateString()).length} Neu</span>
                            <span className="text-gray-400">heute</span>
                        </div>
                    </CardContent>
                </Card>
                <Card className="rounded-lg">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-gray-500 text-sm font-medium">Kunden</span>
                            <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-md flex items-center justify-center">
                                <Users className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-gray-900 mb-1">
                            {customersLoading ? '...' : customers.length}
                        </div>
                        <div className="text-xs text-purple-600 flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            <span>Aktiv</span>
                            <span className="text-gray-400">in diesem Monat</span>
                        </div>
                    </CardContent>
                </Card>
                <Card className="rounded-lg">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-gray-500 text-sm font-medium">Aktive Artikel</span>
                            <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-md flex items-center justify-center">
                                <Package className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-gray-900 mb-1">
                            {loading ? '...' : products.length}
                        </div>
                        <div className="text-xs text-orange-600 flex items-center gap-1">
                            <span>{categories.length}</span>
                            <span className="text-gray-400">Kategorien</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Orders */}
                <div className="lg:col-span-2">
                    <Card className="h-full rounded-lg">
                        <CardHeader>
                            <CardTitle>Letzte Bestellungen</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3">ID</th>
                                            <th className="px-4 py-3">Kunde</th>
                                            <th className="px-4 py-3">Betrag</th>
                                            <th className="px-4 py-3">Zahlung</th>
                                            <th className="px-4 py-3">Land</th>
                                            <th className="px-4 py-3">Status</th>
                                            <th className="px-4 py-3">Datum</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {ordersLoading ? (
                                            <tr><td colSpan="7" className="text-center py-10 text-gray-400">Lade Bestellungen...</td></tr>
                                        ) : orders.length === 0 ? (
                                            <tr><td colSpan="7" className="text-center py-10 text-gray-400">Keine Bestellungen gefunden.</td></tr>
                                        ) : orders.slice(0, 5).map((order) => (
                                            <tr key={order.id} className="border-b hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-3 font-medium text-gray-900">#{order.id.slice(0, 8)}</td>
                                                <td className="px-4 py-3 text-gray-600">{order.customer_name}</td>
                                                <td className="px-4 py-3 font-medium text-gray-900">{Number(order.total_amount).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</td>
                                                <td className="px-4 py-3 text-gray-600 text-xs">
                                                    <span className="flex items-center gap-1.5">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                                                        {order.payment_method || 'PayPal'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-gray-600 text-xs">{order.country || 'DE'}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${order.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                        order.status === 'pending' ? 'bg-blue-100 text-blue-700' :
                                                            order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                                'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                        {order.status === 'completed' ? 'Abgeschlossen' :
                                                            order.status === 'pending' ? 'Hängend' : order.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-gray-500 text-xs">
                                                    {new Date(order.created_at).toLocaleDateString('de-DE')}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions / System Status */}
                <div className="space-y-6">
                    <Card className="rounded-lg">
                        <CardHeader className="pb-3">
                            <CardTitle>Schnellzugriff</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-3">
                            <Button onClick={() => handleTabChange('Kategorien / Artikel')} variant="outline" className="h-auto flex-col gap-2 py-4 justify-center bg-gray-50 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors">
                                <Package className="w-5 h-5 text-gray-500" />
                                <span className="text-xs font-semibold">Artikel</span>
                            </Button>
                            <Button onClick={() => handleTabChange('Bestellungen')} variant="outline" className="h-auto flex-col gap-2 py-4 justify-center bg-gray-50 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors">
                                <ShoppingCart className="w-5 h-5 text-gray-500" />
                                <span className="text-xs font-semibold">Bestellungen</span>
                            </Button>
                            <Button onClick={() => handleTabChange('Kunden')} variant="outline" className="h-auto flex-col gap-2 py-4 justify-center bg-gray-50 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors">
                                <Users className="w-5 h-5 text-gray-500" />
                                <span className="text-xs font-semibold">Kunden</span>
                            </Button>
                            <Button onClick={() => handleTabChange('Einstellungen')} variant="outline" className="h-auto flex-col gap-2 py-4 justify-center bg-gray-50 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors">
                                <Settings className="w-5 h-5 text-gray-500" />
                                <span className="text-xs font-semibold">Einstellungen</span>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="rounded-lg">
                        <CardHeader>
                            <CardTitle>Systemstatus</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Server Status</span>
                                <span className="flex items-center gap-2 text-sm text-green-600 font-medium">
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                    Online
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Datenbank</span>
                                <span className="text-sm text-green-600 font-medium">Verbunden</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Letztes Backup</span>
                                <span className="text-sm text-gray-900">Heute, 04:00</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-gray-900 to-gray-800 text-white border-0 rounded-lg">
                        <CardContent className="p-6">
                            <h3 className="font-bold text-lg mb-2">Pro-Max Upgrade</h3>
                            <p className="text-gray-300 text-sm mb-4">Schalten Sie erweiterte Analysen und Marketing-Tools frei.</p>
                            <Button className="w-full bg-white text-black hover:bg-gray-100 border-0 font-bold rounded-md">
                                Upgrade Jetzt
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );

    const openCustomerDetails = (customer) => {
        setSelectedCustomer(customer);
        setIsCustomerModalOpen(true);
    };

    const renderOrders = () => {
        const getStatusColor = (status) => {
            switch (status) {
                case 'completed': return 'bg-green-500 text-white';
                case 'shipped': return 'bg-blue-500 text-white';
                case 'storniert': return 'bg-red-500 text-white';
                default: return 'bg-yellow-500 text-white';
            }
        };

        return (
            <div className="flex flex-col lg:flex-row gap-6 h-full min-h-[600px]">
                {/* Orders Table - Adjust width if detail is open */}
                <Card className={`transition-all duration-300 rounded-lg ${isSideDetailOpen ? 'lg:w-[40%]' : 'w-full'}`}>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Alle Bestellungen</CardTitle>
                        <Button size="sm" onClick={fetchOrders} variant="outline" className="flex gap-2">
                            <RefreshCw className={`h-4 w-4 ${ordersLoading && 'animate-spin'}`} />
                            {isSideDetailOpen ? '' : 'Aktualisieren'}
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-500 uppercase bg-gray-50/50">
                                    <tr className="border-b">
                                        <th className="px-4 py-3">ID</th>
                                        {!isSideDetailOpen && <th className="px-4 py-3">Kunde</th>}
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3">Versand</th>
                                        <th className="px-4 py-3">Betrag</th>
                                        {!isSideDetailOpen && <th className="px-4 py-3 text-right">Aktion</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {ordersLoading ? (
                                        <tr><td colSpan="7" className="text-center py-10 text-gray-400 font-medium">Lade Bestellungen...</td></tr>
                                    ) : orders.length === 0 ? (
                                        <tr><td colSpan="7" className="text-center py-10 text-gray-400 font-medium">Keine Bestellungen gefunden.</td></tr>
                                    ) : orders.map((order) => (
                                        <tr
                                            key={order.id}
                                            onClick={() => handleViewOrder(order)}
                                            className={`border-b hover:bg-red-50 cursor-pointer transition-colors ${selectedOrder?.id === order.id && isSideDetailOpen ? 'bg-red-50 border-l-4 border-l-red-600' : ''}`}
                                        >
                                            <td className="px-6 py-4 font-mono font-bold text-gray-900">
                                                {order.invoice_number ? `RE-${order.invoice_number}` : `RE-${order.id.slice(0, 8).toUpperCase()}`}
                                            </td>
                                            {!isSideDetailOpen && (
                                                <td className="px-4 py-3">
                                                    <div className="font-medium text-gray-900">{order.customer_name}</div>
                                                    <div className="text-[10px] text-gray-400">{order.customer_email}</div>
                                                </td>
                                            )}
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${getStatusColor(order.status)}`}>
                                                    {statusMap[order.status] || order.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                {order.tracking_number ? (
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-bold text-blue-600 uppercase leading-tight">
                                                            {order.shipping_carrier || 'DHL'}
                                                        </span>
                                                        <span className="text-[11px] font-mono text-gray-500 leading-tight">
                                                            {order.tracking_number}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-[10px] text-gray-400 italic">No Tracking</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 font-black text-gray-900">
                                                {Number(order.total_amount).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                                            </td>
                                            {!isSideDetailOpen && (
                                                <td className="px-4 py-3 text-right">
                                                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-100 font-bold text-xs uppercase pr-0">
                                                        Details <ChevronRight className="w-4 h-4 ml-1" />
                                                    </Button>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Side Detail View - Full Gambio Style */}
                {isSideDetailOpen && selectedOrder && (
                    <div className="lg:w-[60%] animate-in slide-in-from-right-4 duration-300 overflow-hidden">
                        <div className="bg-[#f4f7f9] h-full overflow-y-auto">
                            <div className="space-y-4 p-4">
                                {/* Top Bar with Close */}
                                <div className="bg-white px-4 py-2 border-b border-gray-200 flex items-center justify-between sticky top-0 z-10 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <Button variant="ghost" size="sm" onClick={() => setIsSideDetailOpen(false)} className="h-8 w-8 p-0 hover:bg-gray-100">
                                            <ArrowLeft className="w-4 h-4" />
                                        </Button>
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="text-gray-400">Bestellung</span>
                                            <ChevronRight className="w-3 h-3 text-gray-300" />
                                            <span className="font-bold">#{selectedOrder.id.slice(0, 8).toUpperCase()}</span>
                                        </div>
                                    </div>
                                    <Button variant="outline" size="sm" onClick={() => window.open(`/admin/order/${selectedOrder.id}`, '_blank')} className="h-8 text-xs">
                                        <ExternalLink className="w-3 h-3 mr-2" /> Neue Seite
                                    </Button>
                                </div>

                                {/* 5 Header Cards Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                                    <div className="bg-white p-3 border border-gray-200 flex items-center gap-3">
                                        <div className="bg-gray-100 p-1.5 rounded">
                                            <Package className="w-4 h-4 text-slate-600" />
                                        </div>
                                        <div>
                                            <p className="text-[9px] uppercase text-gray-400 font-bold">Bestellung</p>
                                            <p className="text-sm font-bold">{selectedOrder.id.slice(0, 8).toUpperCase()}</p>
                                        </div>
                                    </div>
                                    <div className="bg-white p-3 border border-gray-200 flex items-center gap-3">
                                        <div className="bg-gray-100 p-1.5 rounded">
                                            <Euro className="w-4 h-4 text-slate-600" />
                                        </div>
                                        <div>
                                            <p className="text-[9px] uppercase text-gray-400 font-bold">Betrag</p>
                                            <p className="text-sm font-bold">{Number(selectedOrder.total_amount).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</p>
                                        </div>
                                    </div>
                                    <div className="bg-white p-3 border border-gray-200 flex items-center gap-3">
                                        <div className="bg-gray-100 p-1.5 rounded">
                                            <Calendar className="w-4 h-4 text-slate-600" />
                                        </div>
                                        <div>
                                            <p className="text-[9px] uppercase text-gray-400 font-bold">Datum</p>
                                            <p className="text-[11px] font-bold">{new Date(selectedOrder.created_at).toLocaleDateString('de-DE')}</p>
                                        </div>
                                    </div>
                                    <div className="bg-white p-3 border border-gray-200 flex items-center gap-3">
                                        <div className="bg-gray-100 p-1.5 rounded">
                                            <CreditCard className="w-4 h-4 text-slate-600" />
                                        </div>
                                        <div>
                                            <p className="text-[9px] uppercase text-gray-400 font-bold">Zahlung</p>
                                            <p className="text-[11px] font-bold uppercase">{selectedOrder.payment_method}</p>
                                        </div>
                                    </div>
                                    <div className="bg-white p-3 border border-gray-200 flex flex-col justify-center">
                                        <p className="text-[9px] uppercase text-gray-400 font-bold mb-1">Status</p>
                                        <div className={`px-2 py-0.5 text-center font-bold text-[11px] ${getStatusColor(selectedOrder.status)}`}>
                                            {(statusMap[selectedOrder.status] || selectedOrder.status).toUpperCase()}
                                        </div>
                                    </div>
                                </div>

                                {/* Artikel Table */}
                                <div className="bg-white border border-gray-200">
                                    <div className="bg-[#e9eff2] px-4 py-2 border-b text-xs font-bold text-[#5c6d80]">Artikel</div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-xs">
                                            <thead className="bg-[#f9fafb] border-b text-[#5c6d80] font-normal uppercase">
                                                <tr>
                                                    <th className="px-3 py-2 text-center">Anzahl</th>
                                                    <th className="px-3 py-2">Artikel</th>
                                                    <th className="px-3 py-2">Artikel-Nr.</th>
                                                    <th className="px-3 py-2 text-right">Netto</th>
                                                    <th className="px-3 py-2 text-right">MwSt.</th>
                                                    <th className="px-3 py-2 text-right">Brutto</th>
                                                    <th className="px-3 py-2 text-right">Gesamt</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {orderItems.map((item) => {
                                                    const bruttPreis = Number(item.price);
                                                    const nettPreis = bruttPreis / 1.19;
                                                    return (
                                                        <tr key={item.id} className="hover:bg-gray-50">
                                                            <td className="px-3 py-2 text-center">{item.quantity}</td>
                                                            <td className="px-3 py-2 text-gray-900">
                                                                <div className="font-bold">{item.products?.name}</div>
                                                                {item.variant_name && (
                                                                    <div className="text-[10px] font-bold text-red-600 uppercase tracking-wider mt-0.5">
                                                                        {item.variant_name}
                                                                    </div>
                                                                )}
                                                            </td>
                                                            <td className="px-3 py-2 font-mono text-gray-500">{item.products?.sku || '---'}</td>
                                                            <td className="px-3 py-2 text-right">{nettPreis.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</td>
                                                            <td className="px-3 py-2 text-right">19%</td>
                                                            <td className="px-3 py-2 text-right">{bruttPreis.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</td>
                                                            <td className="px-3 py-2 text-right font-bold">{(bruttPreis * item.quantity).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="bg-[#f9fafb] p-3 flex justify-end border-t">
                                        <div className="w-48 space-y-1 text-xs text-[#5c6d80]">
                                            {(() => {
                                                const sub = orderItems.reduce((s, i) => s + (Number(i.price) * i.quantity), 0);
                                                const ship = Math.max(0, Number(selectedOrder.total_amount) - sub);
                                                return (
                                                    <>
                                                        <div className="flex justify-between">
                                                            <span>Warenwert:</span>
                                                            <span className="font-bold">{sub.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</span>
                                                        </div>
                                                        <div className="flex justify-between border-b pb-1">
                                                            <span>Versandkosten:</span>
                                                            <span className="font-bold">{ship > 0 ? `${ship.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €` : '0,00 €'}</span>
                                                        </div>
                                                        <div className="flex justify-between text-sm font-black text-gray-900 pt-1">
                                                            <span>Summe:</span>
                                                            <span>{Number(selectedOrder.total_amount).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</span>
                                                        </div>
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                </div>

                                {/* Two Column Layout */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    {/* Left Column */}
                                    <div className="space-y-4">
                                        {/* BestellInformation */}
                                        <div className="bg-white border border-gray-200">
                                            <div className="bg-[#e9eff2] px-4 py-2 border-b text-xs font-bold text-[#5c6d80]">BestellInformation</div>
                                            <div className="p-4">
                                                <div className="grid grid-cols-2 gap-4 mb-4">
                                                    <div>
                                                        <h4 className="text-[9px] font-bold uppercase text-gray-400 border-b pb-1 mb-2">Rechnungsadresse</h4>
                                                        <div className="text-xs space-y-0.5 text-gray-600">
                                                            <p className="font-bold text-gray-900">{orderCustomer ? (orderCustomer.first_name ? `${orderCustomer.first_name} ${orderCustomer.last_name}` : orderCustomer.name) : selectedOrder.customer_name}</p>
                                                            <p>{orderCustomer?.address_street || selectedOrder.street || '---'}</p>
                                                            <p>{orderCustomer?.address_zip || selectedOrder.zip} {orderCustomer?.address_city || selectedOrder.city}</p>
                                                            <p className="uppercase text-[10px] font-bold text-gray-400">{orderCustomer?.address_country || selectedOrder.country || 'Deutschland'}</p>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-[9px] font-bold uppercase text-gray-400 border-b pb-1 mb-2">Lieferanschrift</h4>
                                                        <div className="text-xs space-y-0.5 text-gray-600">
                                                            <p className="font-bold text-gray-900">{orderCustomer ? (orderCustomer.first_name ? `${orderCustomer.first_name} ${orderCustomer.last_name}` : orderCustomer.name) : selectedOrder.customer_name}</p>
                                                            <p>{orderCustomer?.address_street || selectedOrder.street || '---'}</p>
                                                            <p>{orderCustomer?.address_zip || selectedOrder.zip} {orderCustomer?.address_city || selectedOrder.city}</p>
                                                            <p className="uppercase text-[10px] font-bold text-gray-400">{orderCustomer?.address_country || selectedOrder.country || 'Deutschland'}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="pt-3 border-t">
                                                    <span className="text-[9px] font-bold uppercase text-gray-400 block mb-1">E-Mail-Adresse</span>
                                                    <a href={`mailto:${selectedOrder.customer_email}`} className="text-xs text-blue-600 hover:underline">{selectedOrder.customer_email}</a>
                                                </div>
                                            </div>
                                        </div>


                                        {/* Versand (Shipping) */}
                                        <div className="bg-white border border-gray-200">
                                            <div className="bg-[#e9eff2] px-4 py-2 border-b text-xs font-bold text-[#5c6d80] flex justify-between items-center">
                                                <span>Versand</span>
                                                <Truck className="w-3.5 h-3.5 text-gray-400" />
                                            </div>
                                            <div className="p-4 space-y-4">
                                                {/* Shipping Method Selection */}
                                                <div>
                                                    <span className="text-[9px] font-bold uppercase text-gray-400 block mb-1.5">Versandart / Dienstleister</span>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <Select value={shippingCarrier} onValueChange={setShippingCarrier}>
                                                            <SelectTrigger className="h-8 text-[11px] bg-gray-50 border-gray-200">
                                                                <SelectValue placeholder="Dienstleister" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="dhl">DHL</SelectItem>
                                                                <SelectItem value="hermes">Hermes</SelectItem>
                                                                <SelectItem value="ups">UPS</SelectItem>
                                                                <SelectItem value="dpd">DPD</SelectItem>
                                                                <SelectItem value="gls">GLS</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <div className="flex items-center gap-2 px-2 border border-dashed border-gray-200 rounded text-[10px] text-gray-400 italic">
                                                            Paket (versichert)
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Tracking Number */}
                                                <div className="pt-3 border-t">
                                                    <span className="text-[9px] font-bold uppercase text-gray-400 block mb-2">Sendungsnummer (Tracking)</span>
                                                    <div className="flex gap-1.5">
                                                        <Input
                                                            placeholder="Tracking Nr..."
                                                            className="h-8 text-xs bg-gray-50 border-gray-200"
                                                            defaultValue={selectedOrder.tracking_number}
                                                            id="tracking-input-side"
                                                        />
                                                        <Button
                                                            size="sm"
                                                            className="h-8 bg-slate-800 hover:bg-black text-[10px] font-bold"
                                                            onClick={() => updateOrderStatus(selectedOrder.status, document.getElementById('tracking-input-side').value, shippingCarrier)}
                                                            disabled={isSubmitting}
                                                        >
                                                            {isSubmitting ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Senden'}
                                                        </Button>
                                                    </div>
                                                    {selectedOrder.tracking_number && (
                                                        <div className="mt-2 p-2 bg-blue-50/50 border border-blue-100 rounded flex items-center justify-between">
                                                            <div className="flex flex-col">
                                                                <span className="text-[8px] uppercase font-bold text-blue-400">{selectedOrder.shipping_carrier || 'DHL'}</span>
                                                                <span className="text-[10px] text-blue-700 font-mono">{selectedOrder.tracking_number}</span>
                                                            </div>
                                                            <a
                                                                href={
                                                                    selectedOrder.shipping_carrier === 'hermes' ? `https://www.myhermes.de/empfangen/sendungsverfolgung/sendungsinformation#${selectedOrder.tracking_number}` :
                                                                        selectedOrder.shipping_carrier === 'ups' ? `https://www.ups.com/track?tracknum=${selectedOrder.tracking_number}` :
                                                                            selectedOrder.shipping_carrier === 'dpd' ? `https://tracking.dpd.de/status/de_DE/parcel/${selectedOrder.tracking_number}` :
                                                                                selectedOrder.shipping_carrier === 'gls' ? `https://gls-group.eu/DE/de/paketverfolgung?match=${selectedOrder.tracking_number}` :
                                                                                    `https://www.dhl.de/de/privatkunden/pakete-empfangen/verfolgen.html?piececode=${selectedOrder.tracking_number}`
                                                                }
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-[9px] text-blue-600 underline font-bold"
                                                            >
                                                                Tracking Link
                                                            </a>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column */}
                                    <div className="space-y-4">
                                        {/* Kunde */}
                                        <div className="bg-white border border-gray-200">
                                            <div className="bg-[#4fb8d8] px-4 py-2 text-xs font-bold text-white uppercase">Kunde</div>
                                            <div className="p-4 space-y-4">
                                                <div className="text-xs space-y-0.5">
                                                    <p className="font-bold text-gray-900">{orderCustomer ? (orderCustomer.first_name ? `${orderCustomer.first_name} ${orderCustomer.last_name}` : orderCustomer.name) : selectedOrder.customer_name}</p>
                                                    <p className="text-gray-600">{orderCustomer?.address_street || '---'}</p>
                                                    <p className="text-gray-600">{orderCustomer?.address_zip || ''} {orderCustomer?.address_city || ''}</p>
                                                    <p className="text-gray-600">{orderCustomer?.address_country || 'Deutschland'}</p>
                                                </div>
                                                <div className="space-y-1.5 border-t pt-3">
                                                    {[
                                                        ['E-Mail', selectedOrder.customer_email],
                                                        ['Telefon', orderCustomer?.phone || '---'],
                                                        ['Kundengruppe', orderCustomer?.customer_group || 'Privatkunde'],
                                                        ['Sprache', orderCustomer?.language || 'Deutsch']
                                                    ].map(([label, val]) => (
                                                        <div key={label} className="flex text-xs">
                                                            <span className="w-28 text-gray-400 font-bold uppercase text-[9px]">{label}</span>
                                                            <span className="text-[#5c6d80] font-medium">{val}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="space-y-1.5 border-t pt-3">
                                                    {[
                                                        ['Erste Bestellung', new Date(selectedOrder.created_at).toLocaleDateString('de-DE')],
                                                        ['Letzte Bestellung', new Date(selectedOrder.created_at).toLocaleDateString('de-DE')],
                                                        ['Bestellungen gesamt', '1'],
                                                        ['Bestellwert gesamt', `${Number(selectedOrder.total_amount).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`]
                                                    ].map(([label, val]) => (
                                                        <div key={label} className="flex text-xs items-center">
                                                            <span className="w-36 text-gray-400 font-bold uppercase text-[9px]">{label}</span>
                                                            {label === 'Bestellungen gesamt' ? (
                                                                <span className="bg-blue-400 text-white w-5 h-5 flex items-center justify-center rounded-full text-[9px] font-bold">{val}</span>
                                                            ) : (
                                                                <span className="text-[#5c6d80] font-medium">{val}</span>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>



                                        {/* Rechnungen (Invoices) */}
                                        <div className="bg-white border border-gray-200">
                                            <div className="bg-[#e9eff2] px-4 py-2 flex justify-between items-center text-xs font-bold text-[#5c6d80]">
                                                <span>Rechnungen</span>
                                                <div className="text-[10px] font-normal text-gray-400">Automatisch generiert</div>
                                            </div>
                                            <div className="p-3">
                                                <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded border border-transparent hover:border-gray-100 transition-all group">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded bg-red-50 flex items-center justify-center">
                                                            <Scroll className="w-4 h-4 text-red-500" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[11px] font-bold text-gray-900 line-clamp-1">{selectedOrder.invoice_number ? `RE-${selectedOrder.invoice_number}` : `RE-${selectedOrder.id.slice(0, 8).toUpperCase()}`}</span>
                                                            <span className="text-[9px] text-gray-400 font-medium">{new Date(selectedOrder.created_at).toLocaleDateString('de-DE')}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-1 group-hover:opacity-100 opacity-0 transition-opacity">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                                                            onClick={() => { setIsInvoiceModalOpen(true); setInvoiceEditMode(false); }}
                                                        >
                                                            <Eye className="w-3.5 h-3.5" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7 text-gray-400 hover:text-amber-600 hover:bg-amber-50"
                                                            onClick={() => { setIsInvoiceModalOpen(true); setInvoiceEditMode(true); }}
                                                        >
                                                            <Edit3 className="w-3.5 h-3.5" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className={`h-7 w-7 ${isInvoiceStorniert ? 'text-red-600 bg-red-50' : 'text-gray-400 hover:text-red-600 hover:bg-red-50'}`}
                                                            onClick={() => setIsInvoiceStorniert(!isInvoiceStorniert)}
                                                            title={isInvoiceStorniert ? "Stornierung rückgängig" : "Rechnung stornieren"}
                                                        >
                                                            <X className="w-3.5 h-3.5" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-7 px-2 text-[10px] font-bold text-red-600 hover:text-red-700 hover:bg-red-50 gap-1.5"
                                                            onClick={handlePrintInvoice}
                                                        >
                                                            <Download className="w-3 h-3" />
                                                            Drucken
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Actions */}
                                <div className="bg-white p-3 border border-gray-200 flex justify-between items-center sticky bottom-0">
                                    <Button variant="outline" onClick={() => setIsSideDetailOpen(false)} className="h-8 px-4 text-xs">
                                        Zurück
                                    </Button>
                                    <div className="flex gap-2">
                                        <Select value={statusEdit || "pending"} onValueChange={(val) => setStatusEdit(val)}>
                                            <SelectTrigger className="h-8 text-xs w-32 border-gray-300">
                                                <SelectValue placeholder="Status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="pending">Wartend</SelectItem>
                                                <SelectItem value="shipped">Versandt</SelectItem>
                                                <SelectItem value="completed">Abgeschlossen</SelectItem>
                                                <SelectItem value="storniert">Storniert</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Button
                                            onClick={() => updateOrderStatus(statusEdit)}
                                            disabled={isSubmitting}
                                            className="h-8 px-4 bg-[#5c6d80] text-white hover:bg-slate-700 text-xs font-bold uppercase"
                                        >
                                            {isSubmitting ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : 'Status ändern'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderCustomers = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h3 className="text-xl font-black text-gray-900 tracking-tight">Kundenstamm</h3>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Zentrale Mitgliederverwaltung</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative group">
                        <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-600 transition-colors" />
                        <Input
                            placeholder="Suchen..."
                            className="h-9 pl-9 w-64 bg-white border-gray-200 rounded-lg text-xs focus:ring-red-600 transition-all"
                        />
                    </div>
                    <Button size="sm" onClick={fetchCustomers} variant="outline" className="h-9 rounded-lg border-gray-100 hover:bg-gray-50 bg-white">
                        <RefreshCw className={`h-4 w-4 mr-2 ${customersLoading && 'animate-spin'}`} />
                        Aktualisieren
                    </Button>
                </div>
            </div>

            <Card className="border-none shadow-xl shadow-gray-200/40 overflow-hidden">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100 italic">
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Kunden-Nr.</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Mitglied</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Kontakt</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Gruppe</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Seit</th>
                                    <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {customersLoading ? (
                                    <tr><td colSpan="6" className="text-center py-20"><Loader2 className="w-8 h-8 animate-spin text-gray-200 mx-auto" /></td></tr>
                                ) : customers.length === 0 ? (
                                    <tr><td colSpan="6" className="text-center py-20 text-gray-400 font-medium italic">Keine Kunden in der Datenbank vorhanden.</td></tr>
                                ) : customers.map((customer) => (
                                    <tr key={customer.id} className="group hover:bg-gray-50/50 transition-colors cursor-pointer" onClick={() => openCustomerDetails(customer)}>
                                        <td className="px-6 py-5">
                                            <span className="font-mono text-[11px] font-black text-red-600 p-1 bg-red-50 rounded">
                                                {customer.customer_number || '---'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 bg-gray-100 rounded-lg overflow-hidden shadow-inner flex-shrink-0 flex items-center justify-center text-gray-400">
                                                    <User className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 leading-none mb-1">{customer.name}</p>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{customer.company || 'Privatkunde'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <p className="text-xs font-medium text-gray-600">{customer.email}</p>
                                            <p className="text-[10px] text-gray-400 font-mono mt-0.5">{customer.phone || '---'}</p>
                                        </td>
                                        <td className="px-6 py-5">
                                            <Badge variant="secondary" className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-lg border-none shadow-sm ${customer.customer_group === 'Händler' ? 'bg-indigo-50 text-indigo-600' : 'bg-green-50 text-green-600'
                                                }`}>
                                                {customer.customer_group}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="text-[11px] font-bold text-gray-400">
                                                {new Date(customer.created_at).toLocaleDateString('de-DE')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2 group-hover:translate-x-[-4px] transition-transform">
                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                                                <span className="text-[10px] font-black uppercase text-gray-900 tracking-widest">Aktiv</span>
                                                <ChevronRight className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity ml-2" />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    const renderCategoryEditor = () => {
        const isEdit = categoryEditorView === 'edit';

        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={closeEditor}
                            className="text-gray-500"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">
                                {isEdit ? 'Kategorie bearbeiten' : 'Neue Kategorie hinzufügen'}
                            </h3>
                            <p className="text-sm text-gray-500">
                                Verwalten Sie hier Kategorieinformationen, Banner und Hierarchien.
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {isEdit && (
                            <Button
                                variant="outline"
                                onClick={() => handleDeleteCategory(editingItem.id)}
                                className="text-red-500 hover:bg-red-50 border-red-200"
                                disabled={isSubmitting}
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Löschen
                            </Button>
                        )}
                        <Button variant="outline" onClick={closeEditor}>Abbrechen</Button>
                        <Button
                            onClick={handleSaveCategory}
                            className="bg-red-600 hover:bg-red-700 flex items-center gap-2"
                            disabled={isSubmitting}
                        >
                            <Save className="w-4 h-4" />
                            {isSubmitting ? 'Wird gespeichert...' : 'Kategorie speichern'}
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-bold flex items-center gap-2">
                                    <Tag className="w-4 h-4 text-red-600" />
                                    Basisinformationen
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Kategoriename</Label>
                                        <Input
                                            value={formData.name || ''}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="z.B. Elektronik"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Icon (Emoji)</Label>
                                        <Input
                                            value={formData.icon || ''}
                                            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                            placeholder="z.B. 📱"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Slug (URL Link)</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={formData.slug || ''}
                                            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                            placeholder="z.B. elektronik-geraete"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setFormData({ ...formData, slug: slugify(formData.name) })}
                                        >
                                            Generieren
                                        </Button>
                                    </div>
                                    <p className="text-[10px] text-gray-400 italic">Lassen Sie dieses Feld leer, um es automatisch anhand des Namens zu generieren.</p>
                                </div>
                                <div className="space-y-2">
                                    <Label>Beschreibung</Label>
                                    <div className="quill-dark-container">
                                        <ReactQuill
                                            key={`quill-cat-${editingItem?.id || 'new'}-${lastSaveTimestamp}`}
                                            theme="snow"
                                            value={formData.description || ''}
                                            modules={{
                                                toolbar: [
                                                    ['bold', 'italic', 'underline'],
                                                    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                                    ['link', 'clean']
                                                ]
                                            }}
                                            onChange={(content) => setFormData(prev => ({ ...prev, description: content }))}
                                            placeholder="Schreiben Sie bir Kurzinformation über die Kategorie..."
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-bold flex items-center gap-2">
                                    <ImageIcon className="w-4 h-4 text-red-600" />
                                    Bilder & Banner
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Category Image (Square) */}
                                <div className="space-y-2">
                                    <Label>Kategorie-Bild (Quadratisch)</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={formData.image_url || ''}
                                            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                            placeholder="https://example.com/image.jpg"
                                        />
                                        <div className="relative">
                                            <input
                                                type="file"
                                                id="category-image-upload"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={(e) => handleImageUpload(e, 'image_url')}
                                                disabled={isUploading}
                                            />
                                            <Button
                                                variant="outline"
                                                className="flex items-center gap-2 whitespace-nowrap"
                                                onClick={() => document.getElementById('category-image-upload').click()}
                                                disabled={isUploading}
                                            >
                                                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                                Hochladen
                                            </Button>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-gray-400 italic">Wird in der Übersicht ve in Alt-Kategorien-Grids angezeigt.</p>
                                    {formData.image_url && (
                                        <div className="relative w-24 h-24 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 group mt-2">
                                            <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Button
                                                    variant="destructive"
                                                    size="xs"
                                                    className="h-6 w-6 p-0"
                                                    onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))}
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="border-t border-gray-100 pt-4 space-y-2">
                                    <Label>Banner-Bild (Breit)</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={formData.banner_url || ''}
                                            onChange={(e) => setFormData({ ...formData, banner_url: e.target.value })}
                                            placeholder="https://example.com/banner.jpg"
                                        />
                                        <div className="relative">
                                            <input
                                                type="file"
                                                id="category-banner-upload"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={(e) => handleImageUpload(e, 'banner_url')}
                                                disabled={isUploading}
                                            />
                                            <Button
                                                variant="outline"
                                                className="flex items-center gap-2 whitespace-nowrap"
                                                onClick={() => document.getElementById('category-banner-upload').click()}
                                                disabled={isUploading}
                                            >
                                                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                                Hochladen
                                            </Button>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-gray-400 italic">Ein breites Bild, das ganz oben auf der Kategorieseite erscheint.</p>
                                    {formData.banner_url && (
                                        <div className="space-y-4 mt-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Banner Vorschau & Fokus</Label>
                                                <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-gray-200">
                                                    Y-Achse: {formData.banner_position || 'center'}
                                                </span>
                                            </div>

                                            {/* Preview matching CategoryPage aspect/height */}
                                            <div className="relative h-40 w-full bg-white rounded-lg overflow-hidden border border-gray-200 shadow-inner group">
                                                <img
                                                    src={formData.banner_url}
                                                    alt="Live Preview"
                                                    className="w-full h-full object-cover transition-all duration-300"
                                                    style={{ objectPosition: `center ${formData.banner_position || 'center'}` }}
                                                />
                                                <div className="absolute inset-x-0 top-1/2 h-0.5 bg-red-500/30 dashed pointer-events-none" />
                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                                    <span className="bg-black/60 text-white text-[10px] px-2 py-1 rounded backdrop-blur-sm">Seiten-Vorschau (280px simuliert)</span>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase">
                                                    <span>Oben</span>
                                                    <span>Mitte</span>
                                                    <span>Unten</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="100"
                                                    step="1"
                                                    value={parseInt(formData.banner_position) || 50}
                                                    onChange={(e) => setFormData({ ...formData, banner_position: `${e.target.value}%` })}
                                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                                                />
                                                <p className="text-[10px] text-gray-400 italic text-center">Verschieben Sie den Regler, um den Fokus des Banners anzupassen.</p>
                                            </div>

                                            <Button
                                                variant="ghost"
                                                size="xs"
                                                className="w-full text-gray-400 hover:text-red-600 h-8 text-[10px] uppercase font-bold"
                                                onClick={() => setFormData(prev => ({ ...prev, banner_url: '', banner_position: 'center' }))}
                                            >
                                                Banner entfernen
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar Info */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-bold">Konfiguration</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label>Übergeordnete Kategorie</Label>
                                    <Select
                                        value={formData.parent_id || 'none'}
                                        onValueChange={(val) => setFormData({ ...formData, parent_id: val === 'none' ? null : val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Hauptkategorie" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">Keine (Hauptkategorie)</SelectItem>
                                            {/* Recursive Category Selection List */}
                                            {(() => {
                                                const renderOptions = (cats, level = 0) => {
                                                    return cats.map(cat => {
                                                        if (cat.id === editingItem?.id) return null;
                                                        return (
                                                            <React.Fragment key={cat.id}>
                                                                <SelectItem value={cat.id}>
                                                                    {"　".repeat(level)} {level > 0 ? "└ " : ""}{cat.name}
                                                                </SelectItem>
                                                                {cat.subcategories && renderOptions(cat.subcategories, level + 1)}
                                                            </React.Fragment>
                                                        );
                                                    });
                                                };
                                                return renderOptions(categories);
                                            })()}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Reihenfolge (Sort Order)</Label>
                                    <Input
                                        type="number"
                                        value={formData.sort_order || 0}
                                        onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                                        placeholder="0"
                                    />
                                    <p className="text-[10px] text-gray-400 italic">Niedrigere Zahlen werden zuerst angezeigt.</p>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                                    <div className="space-y-0.5">
                                        <Label className="text-sm font-bold text-gray-900">Status</Label>
                                        <p className="text-[10px] text-gray-500">Sichtbarkeit?</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, is_active: !prev.is_active }))}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${formData.is_active ? 'bg-green-600' : 'bg-gray-300'}`}
                                    >
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                                    <div className="space-y-0.5">
                                        <Label className="text-sm font-bold text-gray-900 italic flex items-center gap-2">
                                            <Star className={`w-3.5 h-3.5 ${formData.badge === 'Top' ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                                            Top / Öne Çıkar
                                        </Label>
                                        <p className="text-[10px] text-gray-500">Top sayfasında görünsün mü?</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, badge: prev.badge === 'Top' ? null : 'Top' }))}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${formData.badge === 'Top' ? 'bg-[#5cb85c]' : 'bg-[#1a202c]'}`}
                                    >
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.badge === 'Top' ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </div>

                                {isEdit && (
                                    <div className="pt-4 border-t border-gray-100">
                                        <p className="text-[10px] text-gray-400 mb-1">Kategori ID</p>
                                        <code className="text-[10px] bg-gray-50 p-1 rounded font-mono break-all">{editingItem.id}</code>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        );
    };

    const renderProductEditor = () => {
        const isEdit = productEditorView === 'edit';

        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={closeEditor}
                            className="text-gray-500"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                {isEdit ? 'Artikel bearbeiten' : 'Neuen Artikel hinzufügen'}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Verwalten Sie Artikeldetails, Preise und Lagerbestände.
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={closeEditor}>Abbrechen</Button>
                        <Button
                            onClick={handleSaveProduct}
                            className="bg-red-600 hover:bg-red-700 flex items-center gap-2"
                            disabled={isSubmitting || isUploading}
                        >
                            <Save className="w-4 h-4" />
                            {isSubmitting ? 'Wird gespeichert...' : isUploading ? 'Bilder werden geladen...' : 'Artikel speichern'}
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-bold flex items-center gap-2">
                                    <Package className="w-4 h-4 text-red-600" />
                                    Basisinformationen
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="dark:text-gray-300">Artikelname</Label>
                                        <Input
                                            value={formData.name || ''}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="z.B. iPhone 15 Pro"
                                            className="dark:bg-[#1a1a1a] dark:border-white/10 dark:text-white"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="dark:text-gray-300">Artikelnummer (SKU)</Label>
                                        <Input
                                            value={formData.sku || ''}
                                            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                            placeholder="z.B. IP15-PRO-128"
                                            className="dark:bg-[#1a1a1a] dark:border-white/10 dark:text-white"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="dark:text-gray-300">Beschreibung</Label>
                                    <div className="quill-dark-container">
                                        <ReactQuill
                                            key={`quill-prod-${formData.id || 'new'}-${lastSaveTimestamp}`}
                                            theme="snow"
                                            value={formData.description || ''}
                                            modules={quillModules}
                                            formats={quillFormats}
                                            onChange={(content) => setFormData(prev => ({ ...prev, description: content }))}
                                            placeholder="Geben Sie eine detaillierte Produktbeschreibung ein..."
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-bold flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <ImageIcon className="w-4 h-4 text-red-600" />
                                        Produktbilder
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="file"
                                            id="product-upload"
                                            className="hidden"
                                            accept="image/*"
                                            multiple
                                            onChange={(e) => handleImageUpload(e, 'images')}
                                            disabled={isUploading}
                                        />
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex items-center gap-2"
                                            onClick={() => document.getElementById('product-upload').click()}
                                            disabled={isUploading}
                                        >
                                            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                            Bilder hinzufügen
                                        </Button>
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                                    {(formData.images || []).map((img, idx) => (
                                        <div key={idx} className="relative aspect-square bg-gray-50 rounded-lg overflow-hidden border border-gray-200 group">
                                            <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                                                <Button
                                                    variant="destructive"
                                                    size="icon"
                                                    className="w-6 h-6"
                                                    onClick={() => {
                                                        const newImages = formData.images.filter((_, i) => i !== idx);
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            images: newImages,
                                                            image: prev.image === img ? (newImages[0] || '') : prev.image
                                                        }));
                                                    }}
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                                {formData.image !== img && (
                                                    <Button
                                                        variant="secondary"
                                                        size="icon"
                                                        className="w-6 h-6"
                                                        onClick={() => setFormData(prev => ({ ...prev, image: img }))}
                                                        title="Als Hauptbild"
                                                    >
                                                        <Star className="w-3.5 h-3.5" />
                                                    </Button>
                                                )}
                                            </div>
                                            {formData.image === img && (
                                                <div className="absolute top-1 left-1 bg-red-600 text-white text-[7px] px-1 py-0.5 rounded-sm font-bold uppercase">
                                                    Main
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {(!formData.images || formData.images.length === 0) && (
                                        <div className="col-span-full py-12 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-lg bg-gray-50/50 text-gray-400">
                                            <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                                            <p className="text-sm">Keine Bilder hochgeladen</p>
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-2 pt-4 border-t border-gray-100">
                                    <Label>Bild via URL hinzufügen</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="url-image-input"
                                            placeholder="https://example.com/product.jpg"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    const url = e.currentTarget.value.trim();
                                                    if (url) {
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            images: [...(prev.images || []), url],
                                                            image: prev.image || url
                                                        }));
                                                        e.currentTarget.value = '';
                                                    }
                                                }
                                            }}
                                        />
                                        <Button
                                            variant="secondary"
                                            onClick={() => {
                                                const input = document.getElementById('url-image-input');
                                                const url = input.value.trim();
                                                if (url) {
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        images: [...(prev.images || []), url],
                                                        image: prev.image || url
                                                    }));
                                                    input.value = '';
                                                }
                                            }}
                                        >
                                            Hinzufügen
                                        </Button>
                                    </div>
                                    <Card className="border-gray-100 shadow-sm overflow-hidden">
                                        <CardHeader className="bg-gray-50/50 border-b border-gray-100 py-3">
                                            <CardTitle className="text-sm font-bold flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-2">
                                                    <Layers className="w-4 h-4 text-red-600" />
                                                    Varianten & Optionen
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8 text-[10px] uppercase font-bold px-3 py-0 flex items-center gap-1.5 bg-white border-red-100 text-red-600 hover:bg-red-50"
                                                    onClick={() => openVariantModal()}
                                                >
                                                    <Plus className="w-3.5 h-3.5" />
                                                    Variante hinzufügen
                                                </Button>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-0">
                                            <div className="p-4 bg-gray-50/30 border-b border-gray-100 space-y-2">
                                                <Label className="text-[10px] uppercase tracking-widest text-gray-400 font-black">Titel der Variantengruppe (z.B. "Farbe", "Größenauswahl")</Label>
                                                <Input
                                                    value={formData.variant_title || ''}
                                                    onChange={(e) => setFormData({ ...formData, variant_title: e.target.value })}
                                                    placeholder="Bitte Titel eingeben (z.B. Farbe wählen)..."
                                                    className="h-10 bg-white border-gray-200"
                                                />
                                            </div>
                                            {(formData.variants || []).length > 0 ? (
                                                <div className="divide-y divide-gray-100">
                                                    {formData.variants.map((variant, idx) => (
                                                        <div key={idx} className="p-4 flex items-center justify-between hover:bg-gray-50/30 transition-colors group">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-12 h-12 rounded border border-gray-100 overflow-hidden bg-white flex items-center justify-center shrink-0">
                                                                    {(variant.images && variant.images.length > 0) ? (
                                                                        <img src={variant.images[0]} className="w-full h-full object-contain" alt="" />
                                                                    ) : variant.image ? (
                                                                        <img src={variant.image} className="w-full h-full object-contain" alt="" />
                                                                    ) : (
                                                                        <ImageIcon className="w-5 h-5 text-gray-200" />
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <div className="text-sm font-bold text-gray-900">{variant.name || 'Unbenannte Variante'}</div>
                                                                    <div className="flex items-center gap-3 mt-1">
                                                                        <span className="text-[10px] font-medium text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                                                                            SKU: {variant.sku || 'N/A'}
                                                                        </span>
                                                                        <span className="text-[10px] font-bold text-red-600">
                                                                            {variant.price} €
                                                                        </span>
                                                                        <span className="text-[10px] font-medium text-gray-400">
                                                                            Lager: {variant.stock || 0}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-8 text-[10px] uppercase font-bold text-blue-600 hover:bg-blue-50 px-3"
                                                                    onClick={() => openVariantModal(variant, idx)}
                                                                >
                                                                    <Edit3 className="w-3.5 h-3.5 mr-1.5" />
                                                                    Details bearbeiten
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 text-gray-300 hover:text-red-600 hover:bg-red-50"
                                                                    onClick={() => {
                                                                        const newVariants = formData.variants.filter((_, i) => i !== idx);
                                                                        setFormData({ ...formData, variants: newVariants });
                                                                    }}
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="py-12 flex flex-col items-center justify-center text-gray-400">
                                                    <Layers className="w-10 h-10 mb-3 opacity-10" />
                                                    <p className="text-sm font-medium">Für dieses Produkt wurden noch keine Varianten definiert</p>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="mt-4 text-[10px] uppercase font-bold text-red-600 border-red-100 hover:bg-red-50 px-6 h-9"
                                                        onClick={() => {
                                                            setFormData({
                                                                ...formData, variants: [{
                                                                    attributes: [{ label: '', value: '' }],
                                                                    price: '',
                                                                    stock: ''
                                                                }]
                                                            });
                                                        }}
                                                    >
                                                        Variante erstellen
                                                    </Button>
                                                </div>
                                            )}
                                            <div className="p-4 bg-gray-50/50 border-t border-gray-100">
                                                <p className="text-[10px] text-gray-500 leading-relaxed italic">
                                                    <Star className="w-3 h-3 inline mr-1 text-yellow-500 fill-current" />
                                                    Tipp: Sie können mehrere Eigenschaften für jede Variante hinzufügen (z.B. Farbe und Größe).
                                                    Wenn Sie das Preisfeld leer lassen, wird der Hauptpreis des Produkts verwendet.
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar Info */}
                    <div className="space-y-6">
                        <Card className={`${formData.is_active ? 'border-green-100 bg-green-50/10 dark:border-green-900/30' : 'border-gray-200 bg-gray-50/10 dark:border-white/10 dark:bg-white/5'}`}>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <Label className="flex flex-col">
                                        <span className="font-bold text-gray-900 dark:text-gray-100">Artikelstatus</span>
                                        <span className="text-[10px] text-gray-500 dark:text-gray-400">Sichtbarkeit im Shop</span>
                                    </Label>
                                    <div className="flex items-center gap-3">
                                        <span className={`text-xs font-bold uppercase ${formData.is_active ? 'text-green-600' : 'text-gray-400'}`}>
                                            {formData.is_active ? 'Aktiv' : 'Inaktiv'}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, is_active: !prev.is_active }))}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${formData.is_active ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                                        >
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-100 dark:border-white/5">
                                    <Label className="flex flex-col">
                                        <span className="font-bold text-gray-900 dark:text-gray-100 italic flex items-center gap-2">
                                            <Star className={`w-3.5 h-3.5 ${formData.badge === 'Top' ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300 dark:text-gray-600'}`} />
                                            Top / Hervorgehoben
                                        </span>
                                        <span className="text-[10px] text-gray-500 dark:text-gray-400">Top sayfasında görünsün mü?</span>
                                    </Label>
                                    <div className="flex items-center gap-3">
                                        <span className={`text-xs font-bold uppercase ${formData.badge === 'Top' ? 'text-[#5cb85c]' : 'text-gray-400'}`}>
                                            {formData.badge === 'Top' ? 'Top' : 'Normal'}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, badge: prev.badge === 'Top' ? null : 'Top' }))}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${formData.badge === 'Top' ? 'bg-[#5cb85c]' : 'bg-[#1a202c] dark:bg-gray-800'}`}
                                        >
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.badge === 'Top' ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-bold">Preise & Lager</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label className="dark:text-gray-300">MwSt (%)</Label>
                                        <div className="flex flex-wrap gap-1.5 mb-2">
                                            {taxRatePresets.map(rate => (
                                                <div key={rate} className="group relative">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className={`text-[9px] h-6 px-2 pr-5 dark:border-white/10 dark:text-gray-400 ${formData.tax_rate === rate ? 'bg-red-50 border-red-200 text-red-600 dark:bg-red-900/20 dark:border-red-500/50' : ''}`}
                                                        onClick={() => setFormData({ ...formData, tax_rate: rate })}
                                                    >
                                                        %{rate}
                                                        {defaultTaxRate === rate && (
                                                            <Star className="w-2.5 h-2.5 ml-1 fill-current text-yellow-500" />
                                                        )}
                                                    </Button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            removeTaxRatePreset(rate);
                                                        }}
                                                        className="absolute right-1 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                                                    >
                                                        <X className="w-2.5 h-2.5" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex gap-2">
                                            <Input
                                                type="text"
                                                className="h-8 text-xs dark:bg-[#1a1a1a] dark:border-white/10 dark:text-white"
                                                value={formData.tax_rate || ''}
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/[^0-9.]/g, '');
                                                    setFormData({ ...formData, tax_rate: val });
                                                }}
                                                placeholder="19"
                                            />
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                className="h-8 w-8 p-0 dark:bg-white/5 dark:hover:bg-white/10 dark:text-white"
                                                onClick={() => addTaxRatePreset(formData.tax_rate)}
                                                title="Zur Liste hinzufügen"
                                            >
                                                <Plus className="w-3 h-3" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-8 w-8 p-0 text-yellow-600 border-yellow-200 hover:bg-yellow-50 dark:border-yellow-900/30 dark:hover:bg-yellow-900/10"
                                                onClick={() => setDefaultTaxRate(formData.tax_rate)}
                                                title="Als Standard setzen"
                                            >
                                                <Star className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="dark:text-gray-300">Verkaufspreis (€)</Label>
                                        <Input
                                            type="text"
                                            value={formData.price || ''}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/[^0-9.,]/g, '');
                                                setFormData({ ...formData, price: val });
                                            }}
                                            placeholder="0.00"
                                            className="dark:bg-[#1a1a1a] dark:border-white/10 dark:text-white"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-indigo-600 dark:text-indigo-400 font-bold">Händler Preis (€)</Label>
                                        <Input
                                            type="text"
                                            value={formData.dealer_price || ''}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/[^0-9.,]/g, '');
                                                setFormData({ ...formData, dealer_price: val });
                                            }}
                                            placeholder="0.00"
                                            className="border-indigo-100 focus:border-indigo-500 dark:bg-[#1a1a1a] dark:border-indigo-900/30 dark:text-white"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-red-600 dark:text-red-400 font-bold">İndirimli Fiyat (€)</Label>
                                        <div className="relative">
                                            <Input
                                                type="text"
                                                value={formData.discount_price || ''}
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/[^0-9.,]/g, '');
                                                    setFormData({ ...formData, discount_price: val });
                                                }}
                                                placeholder="0.00"
                                                className="border-red-100 focus:border-red-500 pr-8 dark:bg-[#1a1a1a] dark:border-red-900/30 dark:text-white"
                                            />
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 font-bold text-xs pointer-events-none">
                                                %
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-red-600 dark:text-red-400 font-bold">İndirim Bitiş Tarihi</Label>
                                        <Input
                                            type="date"
                                            value={formData.discount_expiry || ''}
                                            onChange={(e) => setFormData({ ...formData, discount_expiry: e.target.value })}
                                            className="border-red-100 focus:border-red-500 dark:bg-[#1a1a1a] dark:border-red-900/30 dark:text-white"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs">Sitedeki Stok (Online)</Label>
                                        <Input
                                            type="text"
                                            value={formData.stock || ''}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/[^0-9]/g, '');
                                                setFormData({ ...formData, stock: val });
                                            }}
                                            placeholder="0"
                                            className="h-9"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-red-600">Depo Stoğu (Warehouse)</Label>
                                        <Input
                                            type="text"
                                            value={formData.warehouse_stock || ''}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/[^0-9]/g, '');
                                                setFormData({ ...formData, warehouse_stock: val });
                                            }}
                                            placeholder="0"
                                            className="h-9 border-red-100 focus:border-red-600"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Merkmale / Özellikler Kartı */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-bold flex items-center gap-2">
                                    <List className="w-4 h-4 text-red-600" />
                                    Merkmale / Eigenschaften
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <p className="text-[11px] text-gray-400">Diese Merkmale erscheinen als Filter in der Kategorie-Seite (z.B. Rahmen: Aluminium).</p>

                                {/* Schnellauswahl Panel */}
                                <div className="p-3 bg-gray-50/50 dark:bg-white/5 border border-dashed border-gray-200 dark:border-white/10 rounded-lg mb-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[10px] font-bold uppercase text-gray-400 dark:text-gray-500 italic flex items-center gap-1.5">
                                            <Zap className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                            Schnellauswahl / Hızlı Seçim
                                        </span>
                                        {quickAddLabel && (
                                            <Button variant="ghost" size="sm" className="h-5 text-[9px] hover:text-red-600 dark:text-gray-400 dark:hover:text-red-500" onClick={() => setQuickAddLabel("")}>Temizle</Button>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <Select value={quickAddLabel} onValueChange={setQuickAddLabel}>
                                            <SelectTrigger className="w-[140px] h-8 text-xs bg-white dark:bg-[#1a1a1a] border-gray-200 dark:border-white/10 shadow-none dark:text-white">
                                                <SelectValue placeholder="Grup Seç..." />
                                            </SelectTrigger>
                                            <SelectContent className="z-[99999] dark:bg-[#111] dark:border-white/10">
                                                {uniqueAttributeLabels.map((l, i) => (
                                                    <SelectItem key={i} value={l}>{l}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <div className="flex-1 flex flex-wrap gap-1.5 min-h-[32px]">
                                            {!quickAddLabel ? (
                                                <p className="text-[10px] text-gray-400 self-center italic">Önce bir grup seçin (örn. Farbe)</p>
                                            ) : (uniqueAttributeValuesByLabel[quickAddLabel] || []).length > 0 ? (
                                                uniqueAttributeValuesByLabel[quickAddLabel].map((v, i) => (
                                                    <Button
                                                        key={i}
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-7 px-2 text-[11px] bg-white dark:bg-[#1a1a1a] border-gray-200 dark:border-white/10 hover:border-red-600 dark:hover:border-red-500 hover:text-red-600 dark:hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all font-medium shadow-none group dark:text-white"
                                                        onClick={() => {
                                                            const currentAttrs = formData.attributes || [];
                                                            // Avoid duplicates if desired, or just add
                                                            setFormData({ ...formData, attributes: [...currentAttrs, { label: quickAddLabel, value: v }] });
                                                        }}
                                                    >
                                                        <Plus className="w-3 h-3 mr-1 opacity-50 group-hover:opacity-100" />
                                                        {v}
                                                    </Button>
                                                ))
                                            ) : (
                                                <p className="text-[10px] text-gray-400 self-center italic">Bu grup için henüz değer yok.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {(formData.attributes || []).map((attr, idx) => (
                                    <div key={idx} className="flex gap-2 items-center">
                                        <Input
                                            className="flex-1 h-8 text-sm dark:bg-[#1a1a1a] dark:border-white/10 dark:text-white"
                                            placeholder="Merkmal (z.B. Rahmen)"
                                            value={attr.label || ''}
                                            list="attr-labels-list"
                                            onChange={(e) => {
                                                const newAttrs = [...(formData.attributes || [])];
                                                newAttrs[idx] = { ...newAttrs[idx], label: e.target.value };
                                                setFormData({ ...formData, attributes: newAttrs });
                                            }}
                                        />
                                        <datalist id="attr-labels-list">
                                            {uniqueAttributeLabels.map((l, i) => (
                                                <option key={i} value={l} />
                                            ))}
                                        </datalist>
                                        <span className="text-gray-400 dark:text-gray-500 text-sm">:</span>
                                        <Input
                                            className="flex-1 h-8 text-sm dark:bg-[#1a1a1a] dark:border-white/10 dark:text-white"
                                            placeholder="Wert (z.B. Aluminium)"
                                            value={attr.value || ''}
                                            list={attr.label ? `attr-vals-${attr.label.trim().replace(/\s+/g, '-')}` : undefined}
                                            onChange={(e) => {
                                                const newAttrs = [...(formData.attributes || [])];
                                                newAttrs[idx] = { ...newAttrs[idx], value: e.target.value };
                                                setFormData({ ...formData, attributes: newAttrs });
                                            }}
                                        />
                                        {attr.label && uniqueAttributeValuesByLabel[attr.label.trim()] && (
                                            <datalist id={`attr-vals-${attr.label.trim().replace(/\s+/g, '-')}`}>
                                                {uniqueAttributeValuesByLabel[attr.label.trim()].map((v, i) => (
                                                    <option key={i} value={v} />
                                                ))}
                                            </datalist>
                                        )}
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10"
                                            onClick={() => {
                                                const newAttrs = (formData.attributes || []).filter((_, i) => i !== idx);
                                                setFormData({ ...formData, attributes: newAttrs });
                                            }}
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                ))}
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="w-full text-xs border-dashed border-gray-300 text-gray-500 hover:border-red-300 hover:text-red-600"
                                    onClick={() => {
                                        const newAttrs = [...(formData.attributes || []), { label: '', value: '' }];
                                        setFormData({ ...formData, attributes: newAttrs });
                                    }}
                                >
                                    <Plus className="w-3.5 h-3.5 mr-1" /> Merkmal hinzufügen
                                </Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-bold flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-red-600" />
                                    Lieferzeit
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="dark:text-gray-300">Lieferzeit auswählen veya yazın</Label>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {deliveryTimePresets.map(time => (
                                            <div key={time} className="group relative">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className={`text-[10px] h-7 pr-7 dark:border-white/10 dark:text-gray-400 ${formData.delivery_time === time ? 'bg-red-50 border-red-200 text-red-600 dark:bg-red-900/20 dark:border-red-500/50' : ''}`}
                                                    onClick={() => setFormData({ ...formData, delivery_time: time })}
                                                >
                                                    {time}
                                                    {defaultDeliveryTime === time && (
                                                        <Star className="w-2.5 h-2.5 ml-1 fill-current text-yellow-500" />
                                                    )}
                                                </Button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        removeDeliveryTimePreset(time);
                                                    }}
                                                    className="absolute right-1 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                                                    title="Löschen"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex gap-2">
                                        <Input
                                            className="flex-1 dark:bg-[#1a1a1a] dark:border-white/10 dark:text-white"
                                            value={formData.delivery_time || ''}
                                            onChange={(e) => setFormData({ ...formData, delivery_time: e.target.value })}
                                            placeholder="z.B. 6-7 Tage oder 14 KW"
                                        />
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            className="dark:bg-white/5 dark:hover:bg-white/10 dark:text-white"
                                            onClick={() => addDeliveryTimePreset(formData.delivery_time)}
                                            title="Zur Liste hinzufügen"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setDefaultDeliveryTime(formData.delivery_time)}
                                            className="text-yellow-600 border-yellow-200 hover:bg-yellow-50 dark:border-yellow-900/30 dark:hover:bg-yellow-900/10"
                                            title="Als Standard setzen"
                                        >
                                            <Star className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <p className="text-[10px] text-gray-400 dark:text-gray-500">
                                        Tipp: Mit dem +-Button zur Liste hinzufügen, mit dem Stern-Button als Standard setzen.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-bold">Kategorisierung</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3 border border-gray-100 dark:border-white/5 rounded-lg p-4 max-h-[300px] overflow-y-auto bg-white dark:bg-white/5 shadow-sm">
                                    <div className="flex items-center justify-between mb-2">
                                        <Label className="text-xs font-bold uppercase text-gray-400 dark:text-gray-500">Kategorien auswählen</Label>
                                        <span className="text-[10px] bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded-full font-bold">
                                            {(formData.category_ids || []).length} ausgewählt
                                        </span>
                                    </div>
                                    <div className="-ml-4">
                                        <CategoryCheckboxTree
                                            categories={categories}
                                            selectedIds={formData.category_ids || []}
                                            onToggle={(id) => {
                                                const currentIds = formData.category_ids || [];
                                                const newIds = currentIds.includes(id)
                                                    ? currentIds.filter(i => i !== id)
                                                    : [...currentIds, id];
                                                setFormData({ ...formData, category_ids: newIds });
                                            }}
                                        />
                                    </div>
                                    {(!formData.category_ids || formData.category_ids.length === 0) && (
                                        <div className="flex items-center gap-1.5 mt-2 bg-red-50 dark:bg-red-900/10 p-2 rounded text-red-600 dark:text-red-400">
                                            <AlertCircle className="w-3.5 h-3.5" />
                                            <p className="text-[10px] font-medium">Bitte mindestens eine Kategorie wählen.</p>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <Truck className="w-3.5 h-3.5 text-blue-500" />
                                        Versandart & Kosten
                                    </Label>
                                    <Select
                                        value={formData.shipping_method_id || 'Klein Paket'}
                                        onValueChange={(val) => {
                                            // Store the group name as the ID
                                            setFormData({
                                                ...formData,
                                                shipping_method_id: val,
                                                shipping_method_name: val
                                            });
                                        }}
                                    >
                                        <SelectTrigger className="bg-blue-50/30 border-blue-100">
                                            <SelectValue placeholder="Versandgruppe wählen" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {['Klein Paket', 'Gross Paket', 'Spedition'].map(group => (
                                                <SelectItem key={group} value={group}>
                                                    {group}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-[10px] text-gray-400">Wird im Warenkorb für diesen Artikel priorisiert.</p>
                                </div>

                                <div className="space-y-2">
                                    <Label className="dark:text-gray-300">Hersteller</Label>
                                    <Select
                                        value={formData.manufacturer_id?.toString()}
                                        onValueChange={(val) => setFormData({ ...formData, manufacturer_id: val })}
                                    >
                                        <SelectTrigger className="dark:bg-[#1a1a1a] dark:border-white/10 dark:text-white">
                                            <SelectValue placeholder="Hersteller wählen" />
                                        </SelectTrigger>
                                        <SelectContent className="dark:bg-[#111] dark:border-white/10">
                                            <SelectItem value="none">Kein Hersteller</SelectItem>
                                            {manufacturers.map(m => (
                                                <SelectItem key={m.id} value={m.id.toString()}>{m.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        );
    };

    const renderProducts = () => {
        if (categoryEditorView) return renderCategoryEditor();
        if (productEditorView) return renderProductEditor();

        // Helper to get all subcategory IDs recursively
        const getAllCategoryIdsRecursive = (catId) => {
            let ids = [catId];
            flatCategories.filter(c => c.parent_id === catId).forEach(sub => {
                ids = [...ids, ...getAllCategoryIdsRecursive(sub.id)];
            });
            return ids;
        };

        // Data processing for the table
        const currentId = selectedCategoryDetail?.id || null;
        const isUncategorized = selectedCategoryDetail?.id === 'uncategorized';

        const displayItems = [];

        // Add Categories if not in "Uncategorized" view
        if (!isUncategorized) {
            const filteredCategories = flatCategories
                .filter(c => c.parent_id === currentId)
                .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

            filteredCategories.forEach(c => {
                const subCatIds = getAllCategoryIdsRecursive(c.id);
                const count = products.filter(p => {
                    const pCatIds = Array.isArray(p.category_ids) && p.category_ids.length > 0
                        ? p.category_ids
                        : (p.category_id ? [p.category_id] : []);
                    return pCatIds.some(id => subCatIds.includes(id));
                }).length;
                displayItems.push({ ...c, rowType: 'category', productCount: count });
            });
        }

        // Add Products (Recursive filtering)
        const filteredProducts = products.filter(p => {
            const pCategoryIds = Array.isArray(p.category_ids) && p.category_ids.length > 0
                ? p.category_ids
                : (p.category_id ? [p.category_id] : []);

            if (isUncategorized) {
                return pCategoryIds.length === 0 || !pCategoryIds.some(id => flatCategories.some(c => c.id === id));
            }
            if (!currentId) return false;

            const allRelatedIds = getAllCategoryIdsRecursive(currentId);
            return pCategoryIds.some(id => allRelatedIds.includes(id));
        });

        filteredProducts.forEach(p => {
            displayItems.push({ ...p, rowType: 'product' });
        });

        // Pagination Logic
        const totalItemsCount = displayItems.length;
        const totalPages = Math.ceil(totalItemsCount / itemsPerPage);
        const startIndex = (currentPage - 1) * itemsPerPage;
        const paginatedItems = displayItems.slice(startIndex, startIndex + itemsPerPage);

        // Toggle Handlers
        const toggleItemActive = async (item, type) => {
            try {
                const table = type === 'category' ? 'categories' : 'products';
                const { error } = await supabase
                    .from(table)
                    .update({ is_active: !item.is_active })
                    .eq('id', item.id);

                if (error) throw error;

                // Refresh local state
                if (type === 'category') {
                    setFlatCategories(prev => prev.map(c => c.id === item.id ? { ...c, is_active: !c.is_active } : c));
                } else {
                    setProducts(prev => prev.map(p => p.id === item.id ? { ...p, is_active: !p.is_active } : p));
                }
                toast.success(`${type === 'category' ? 'Kategorie' : 'Produkt'} Status aktualisiert`);
            } catch (err) {
                toast.error("Fehler beim Aktualisieren: " + err.message);
            }
        };

        const toggleTopBadge = async (item, type) => {
            try {
                const isTop = item.badge === 'Top';
                const newBadge = isTop ? null : 'Top';
                const newBadgeType = isTop ? null : 'default';

                const table = type === 'category' ? 'categories' : 'products';
                const { error } = await supabase
                    .from(table)
                    .update({ badge: newBadge, badge_type: newBadgeType })
                    .eq('id', item.id);

                if (error) throw error;

                if (type === 'category') {
                    setFlatCategories(prev => prev.map(c => c.id === item.id ? { ...c, badge: newBadge, badge_type: newBadgeType } : c));
                } else {
                    setProducts(prev => prev.map(p => p.id === item.id ? { ...p, badge: newBadge, badge_type: newBadgeType } : p));
                }
                toast.success(`${type === 'category' ? 'Kategorie' : 'Produkt'} Top-Status aktualisiert`);
            } catch (err) {
                toast.error("Fehler: " + err.message);
            }
        };

        // Breadcrumb Helper
        const renderBreadcrumbs = () => {
            const path = [];
            let current = selectedCategoryDetail;
            while (current && current.id !== 'uncategorized' && current.parent_id) {
                const parent = flatCategories.find(c => c.id === current.parent_id);
                if (parent) {
                    path.unshift(parent);
                    current = parent;
                } else break;
            }

            return (
                <div className="flex items-center gap-1.5 overflow-hidden">
                    <button onClick={() => handleCategoryFilterChange('root')} className="hover:text-red-600 transition-colors">Root</button>
                    {path.map((p, idx) => (
                        <React.Fragment key={p.id}>
                            <ChevronRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                            <button onClick={() => handleCategoryFilterChange(p)} className="hover:text-red-600 transition-colors">{p.name}</button>
                        </React.Fragment>
                    ))}
                    {selectedCategoryDetail && (
                        <>
                            <ChevronRight className="w-3 h-3" />
                            <span className="text-gray-900">{selectedCategoryDetail.name}</span>
                        </>
                    )}
                </div>
            );
        };

        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col min-h-[700px] animate-in fade-in duration-500">
                {/* Header Page Title & Erstellen Button */}
                <div className="p-6 pb-2">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-[#1a202c]">Kategorien / Artikel</h2>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button className="bg-[#5cb85c] hover:bg-[#4cae4c] text-white flex items-center gap-0 rounded px-4 h-10 font-bold border-none shadow-none group">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Erstellen
                                    <div className="ml-3 pl-3 border-l border-white/30 h-10 flex items-center group-hover:border-white/50 transition-colors">
                                        <ChevronDown className="w-4 h-4" />
                                    </div>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 p-2">
                                <DropdownMenuItem onClick={() => openCategoryAddPage(currentId)} className="cursor-pointer py-3 rounded-md hover:bg-gray-50 focus:bg-gray-50">
                                    <div className="w-8 h-8 rounded bg-blue-50 text-blue-600 flex items-center justify-center mr-3">
                                        <FolderPlus className="w-4 h-4" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-sm">Neue Kategorie</span>
                                        <span className="text-[10px] text-gray-500">Ordner für Sortierung</span>
                                    </div>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openProductAddPage(currentId)} className="cursor-pointer py-3 rounded-md hover:bg-gray-50 focus:bg-gray-50">
                                    <div className="w-8 h-8 rounded bg-green-50 text-green-600 flex items-center justify-center mr-3">
                                        <PlusSquare className="w-4 h-4" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-sm">Neuer Artikel</span>
                                        <span className="text-[10px] text-gray-500">Einzelnes Produkt</span>
                                    </div>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {renderBreadcrumbs()}
                </div>

                {/* Table with fixed columns logic */}
                <div className="overflow-x-auto flex-1 border-t border-gray-100">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-200 text-[11px] font-black text-gray-400 uppercase tracking-widest bg-gray-50/50">
                                <th className="px-3 py-4 w-12 text-center border-r border-gray-100">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-600 cursor-pointer"
                                        checked={paginatedItems.length > 0 && paginatedItems.every(i => selectedRowIds.includes(i.id))}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                const newSelected = [...new Set([...selectedRowIds, ...paginatedItems.map(i => i.id)])];
                                                setSelectedRowIds(newSelected);
                                            } else {
                                                setSelectedRowIds(prev => prev.filter(id => !paginatedItems.map(i => i.id).includes(id)));
                                            }
                                        }}
                                    />
                                </th>
                                <th className="px-3 py-4 w-16">Sort.</th>
                                <th className="px-3 py-4">Kategorie / Artikel</th>
                                <th className="px-3 py-4 w-28">Artikel-Nr. <ArrowUp className="w-3 h-3 inline mb-0.5 ml-1" /></th>
                                <th className="px-3 py-4 w-20 text-left">Lager</th>
                                <th className="px-3 py-4 w-24 text-left">Status</th>
                                <th className="px-3 py-4 w-20 text-left">Top</th>
                                <th className="px-3 py-4 w-32">Preis</th>
                                <th className="px-3 py-4 w-32">Händler Preis</th>
                                <th className="px-3 py-4 w-16">Max.</th>
                                <th className="px-3 py-4"></th> {/* Spacer column to push everything left */}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {paginatedItems.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="py-20 text-center">
                                        <div className="flex flex-col items-center opacity-40">
                                            <Box className="w-12 h-12 mb-3" />
                                            <p className="text-sm font-bold uppercase tracking-widest">Keine Einträge in dieser Kategorie</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : paginatedItems.map((item) => (
                                <tr key={item.id} className={`hover:bg-gray-50/80 transition-all text-[13px] group ${selectedRowIds.includes(item.id) ? 'bg-red-50/30' : ''}`}>
                                    <td className="px-3 py-3 text-center border-r border-gray-50">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-600 cursor-pointer"
                                            checked={selectedRowIds.includes(item.id)}
                                            onChange={() => {
                                                setSelectedRowIds(prev =>
                                                    prev.includes(item.id)
                                                        ? prev.filter(id => id !== item.id)
                                                        : [...prev, item.id]
                                                );
                                            }}
                                        />
                                    </td>

                                    <td className="px-3 py-3 font-medium text-gray-600">
                                        {item.rowType === 'category' ? item.sort_order || 0 : '0'}
                                    </td>

                                    <td className="px-3 py-3 min-w-[300px]">
                                        <div className="flex items-center gap-3">
                                            {item.rowType === 'category' ? (
                                                <div className="flex items-center gap-3 group/cat">
                                                    <div
                                                        className="flex items-center gap-3 cursor-pointer"
                                                        onClick={() => handleCategoryFilterChange(item)}
                                                    >
                                                        <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-gray-600 group-hover/cat:bg-red-50 group-hover/cat:text-red-600 transition-colors shadow-sm">
                                                            <Folder className="w-4 h-4 fill-current" />
                                                        </div>
                                                        <span className="font-black text-gray-900 uppercase tracking-tighter text-[11px] group-hover/cat:text-red-600 transition-colors flex items-center gap-2">
                                                            {item.name}
                                                            {item.productCount > 0 && (
                                                                <span className="bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded text-[9px] group-hover/cat:bg-red-100 group-hover/cat:text-red-600 transition-colors">
                                                                    {item.productCount}
                                                                </span>
                                                            )}
                                                        </span>
                                                    </div>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            openCategoryModal(item);
                                                        }}
                                                        className="p-2 hover:bg-red-50 rounded-full text-gray-400 hover:text-red-600 transition-all bg-white shadow-sm border border-gray-100"
                                                        title="Kategorie bearbeiten"
                                                    >
                                                        <Edit3 className="w-4.5 h-4.5" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteCategory(item.id);
                                                        }}
                                                        className="p-2 hover:bg-red-50 rounded-full text-gray-400 hover:text-red-600 transition-all bg-white shadow-sm border border-gray-100"
                                                        title="Kategorie löschen"
                                                    >
                                                        <Trash2 className="w-4.5 h-4.5 text-red-400" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-3 group/item">
                                                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => openProductModal(item)}>
                                                        <div className="w-8 h-8 rounded overflow-hidden bg-white border border-gray-100 flex-shrink-0">
                                                            <img src={item.image || 'https://placehold.co/100x100?text=No+Img'} className="w-full h-full object-cover" alt="" />
                                                        </div>
                                                        <span className="text-gray-700 font-medium leading-tight line-clamp-2 hover:text-red-600 transition-colors uppercase text-[11px] tracking-tight">{item.name}</span>
                                                    </div>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteProduct(item.id);
                                                        }}
                                                        className="p-2 opacity-0 group-hover/item:opacity-100 hover:bg-red-50 rounded-full text-gray-400 hover:text-red-600 transition-all bg-white shadow-sm border border-gray-100"
                                                        title="Produkt löschen"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </td>

                                    <td className="px-3 py-3 text-gray-500 font-bold font-mono text-[11px]">
                                        {item.rowType === 'product' ? item.sku || '-' : ''}
                                    </td>

                                    <td className="px-3 py-3 text-left font-black text-gray-900 border-x border-gray-50 bg-gray-50/20">
                                        {item.rowType === 'product' ? (item.stock || 0) : ''}
                                    </td>

                                    <td className="px-3 py-3 text-left">
                                        <div
                                            onClick={() => toggleItemActive(item, item.rowType)}
                                            className={`w-12 h-6 rounded-sm p-1 cursor-pointer transition-all duration-300 shadow-inner flex items-center ${item.is_active ? 'bg-[#5cb85c]' : 'bg-gray-300'}`}
                                        >
                                            <div className={`w-4 h-4 bg-white rounded-sm shadow-md transition-all duration-300 transform ${item.is_active ? 'translate-x-[20px]' : 'translate-x-0'}`}></div>
                                        </div>
                                    </td>

                                    <td className="px-3 py-3 text-left">
                                        <div
                                            onClick={() => toggleTopBadge(item, item.rowType)}
                                            className={`w-12 h-6 rounded-sm transition-all duration-300 flex items-center justify-between px-1.5 cursor-pointer shadow-md overflow-hidden ${item.badge === 'Top' ? 'bg-[#5cb85c]' : 'bg-[#1a202c]'}`}
                                        >
                                            {item.badge === 'Top' ? (
                                                <>
                                                    <div className="w-4 h-4 bg-white rounded-sm"></div>
                                                    <Check className="w-3.5 h-3.5 text-white" strokeWidth={4} />
                                                </>
                                            ) : (
                                                <>
                                                    <X className="w-3.5 h-3.5 text-white" strokeWidth={4} />
                                                    <div className="w-4 h-4 bg-white rounded-sm"></div>
                                                </>
                                            )}
                                        </div>
                                    </td>

                                    <td className="px-3 py-3">
                                        {item.rowType === 'product' ? (
                                            <div className="flex flex-col text-[11px] font-bold leading-normal">
                                                <div className="flex items-center justify-between text-gray-900">
                                                    <span>{Number(item.price).toLocaleString('de-DE', { minimumFractionDigits: 2 })}</span>
                                                    <span>EUR</span>
                                                </div>
                                                <div className="flex items-center justify-between text-gray-400 font-medium">
                                                    <span>Netto: {Number(item.price / 1.19).toLocaleString('de-DE', { minimumFractionDigits: 2 })}</span>
                                                    <span>EUR</span>
                                                </div>
                                            </div>
                                        ) : ''}
                                    </td>
                                    <td className="px-3 py-3">
                                        {item.rowType === 'product' ? (
                                            <div className="flex flex-col text-[11px] font-bold leading-normal">
                                                <div className="flex items-center justify-between text-indigo-700">
                                                    <span>{Number(item.dealer_price || 0).toLocaleString('de-DE', { minimumFractionDigits: 2 })}</span>
                                                    <span>EUR</span>
                                                </div>
                                                <div className="flex items-center justify-between text-indigo-400 font-medium">
                                                    <span>Netto: {Number((item.dealer_price || 0) / 1.19).toLocaleString('de-DE', { minimumFractionDigits: 2 })}</span>
                                                    <span>EUR</span>
                                                </div>
                                            </div>
                                        ) : ''}
                                    </td>

                                    <td className="px-3 py-3 text-[11px] font-bold text-gray-400">
                                        {item.rowType === 'product' ? '0.00%' : ''}
                                    </td>
                                    <td className="px-3 py-3"></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer Logic: Selection, Filter, Counts, Pagination */}
                <div className="p-4 px-6 bg-[#f9fafb] border-t border-gray-200 flex flex-wrap justify-between items-center gap-6 shadow-inner print:hidden">
                    <div className="flex items-center gap-3">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="h-9 px-4 rounded-sm border-gray-200 bg-white text-gray-400 text-xs font-bold uppercase tracking-wider gap-2">
                                    <Trash2 className="w-4 h-4" />
                                    Löschen
                                    <ChevronDown className="w-3 h-3 ml-1" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="p-1">
                                <DropdownMenuItem
                                    onClick={handleBulkDelete}
                                    className="text-red-500 font-bold focus:text-red-600 focus:bg-red-50 cursor-pointer"
                                >
                                    Markierte löschen ({selectedRowIds.length})
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    <div className="flex items-center gap-8 text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                        <div className="flex items-center gap-2">
                            <span>Kategorien:</span>
                            <span className="text-gray-900 bg-white border px-2 py-0.5 rounded shadow-sm">
                                {flatCategories.filter(c => c.parent_id === currentId).length}
                            </span>
                        </div>

                        <div className="flex items-center gap-3">
                            <Select
                                value={currentId === 'uncategorized' ? 'uncategorized' : (currentId || 'root')}
                                onValueChange={(val) => handleCategoryFilterChange(val)}
                            >
                                <SelectTrigger className="h-9 w-40 bg-white text-[10px] font-black tracking-widest border-gray-200">
                                    <SelectValue placeholder="Filter" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="root">ROOT CATEGORIES</SelectItem>
                                    <SelectItem value="uncategorized">UNCATEGORIZED</SelectItem>
                                    {flatCategories.filter(c => !c.parent_id).map(c => (
                                        <SelectItem key={c.id} value={c.id}>{c.name.toUpperCase()}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center gap-6 border-l border-gray-200 pl-8">
                            <span>{totalItemsCount > 0 ? startIndex + 1 : 0} bis {Math.min(startIndex + itemsPerPage, totalItemsCount)} (von {totalItemsCount})</span>
                            <span className="text-red-600 font-black">Seite {currentPage} von {totalPages || 1}</span>
                        </div>
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex items-center gap-1 bg-white p-1 rounded-md border border-gray-100 shadow-sm ml-auto">
                            <Button
                                variant="ghost"
                                size="sm"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                className="h-8 w-8 p-0 text-gray-500 hover:text-red-600 hover:bg-red-50 disabled:opacity-30"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                                // Logic to show limited page numbers if there are too many
                                if (totalPages > 7) {
                                    if (pageNum > 1 && pageNum < totalPages && (pageNum < currentPage - 1 || pageNum > currentPage + 1)) {
                                        if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                                            return <span key={pageNum} className="text-gray-300 px-1 text-[10px]">...</span>;
                                        }
                                        return null;
                                    }
                                }

                                return (
                                    <Button
                                        key={pageNum}
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`h-8 w-8 p-0 text-[11px] font-bold rounded-sm transition-all ${
                                            currentPage === pageNum 
                                                ? 'bg-red-600 text-white hover:bg-red-700 shadow-sm' 
                                                : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
                                        }`}
                                    >
                                        {pageNum}
                                    </Button>
                                );
                            })}

                            <Button
                                variant="ghost"
                                size="sm"
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                className="h-8 w-8 p-0 text-gray-500 hover:text-red-600 hover:bg-red-50 disabled:opacity-30"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderManufacturers = () => {
        return (
            <div className="p-6">
                <div className="mb-6 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Hersteller</h2>
                        <p className="text-gray-600 mt-1">Verwalten Sie Ihre Hersteller</p>
                    </div>
                    <Button
                        onClick={() => {
                            setEditingItem(null);
                            setManufacturerFormData({
                                name: '',
                                logo_url: '',
                                banner_url: '',
                                website: '',
                                address: '',
                                zip_code: '',
                                city: '',
                                country: '',
                                description: '',
                                banner_position: '50% 50%',
                                is_active: true
                            });
                            setIsManufacturerModalOpen(true);
                        }}
                        className="bg-red-600 hover:bg-red-700"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Neuer Hersteller
                    </Button>
                </div>

                {/* Manufacturers Table */}
                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Logo</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Website</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PLZ</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stadt</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Land</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aktionen</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {manufacturers && manufacturers.length === 0 ? (
                                        <tr>
                                            <td colSpan="8" className="px-6 py-12 text-center text-gray-500 italic">
                                                Keine Hersteller in der Datenbank gefunden.
                                            </td>
                                        </tr>
                                    ) : (
                                        (manufacturers || []).map((manufacturer) => (
                                            <tr key={manufacturer.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {manufacturer.logo_url ? (
                                                        <img src={manufacturer.logo_url} alt={manufacturer.name} className="h-10 w-10 object-contain" />
                                                    ) : (
                                                        <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center">
                                                            <Tag className="w-5 h-5 text-gray-400" />
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{manufacturer.name}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {manufacturer.website ? (
                                                        <a href={manufacturer.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-800">
                                                            {manufacturer.website}
                                                        </a>
                                                    ) : (
                                                        <span className="text-sm text-gray-400">-</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {manufacturer.zip_code || '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {manufacturer.city || '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {manufacturer.country || '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <Badge className={manufacturer.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                                        {manufacturer.is_active ? 'Aktiv' : 'Inaktiv'}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => {
                                                                setEditingItem(manufacturer);
                                                                setManufacturerFormData({
                                                                    ...manufacturer,
                                                                    banner_position: manufacturer.banner_position || '50% 50%'
                                                                });
                                                                setIsManufacturerModalOpen(true);
                                                            }}
                                                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                                                        >
                                                            <Edit3 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteManufacturer(manufacturer.id)}
                                                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Manufacturer Modal */}
                <Dialog open={isManufacturerModalOpen} onOpenChange={setIsManufacturerModalOpen}>
                    <DialogContent
                        className="max-w-2xl"
                        onInteractOutside={(e) => {
                            // Don't close or steal focus if interacting with Jodit dropdowns/popups
                            const target = e.target;
                            if (target && typeof target.closest === 'function' && target.closest('.jodit')) {
                                e.preventDefault();
                            }
                        }}
                        onOpenAutoFocus={(e) => e.preventDefault()}
                    >
                        <DialogHeader>
                            <DialogTitle>
                                {editingItem ? 'Hersteller bearbeiten' : 'Neuer Hersteller'}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name *</Label>
                                    <Input
                                        id="name"
                                        value={manufacturerFormData.name}
                                        onChange={(e) => setManufacturerFormData({ ...manufacturerFormData, name: e.target.value })}
                                        placeholder="z.B. Magura"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="website">Website</Label>
                                    <Input
                                        id="website"
                                        value={manufacturerFormData.website}
                                        onChange={(e) => setManufacturerFormData({ ...manufacturerFormData, website: e.target.value })}
                                        placeholder="https://www.example.com"
                                    />
                                </div>
                            </div>
                            {/* Live Preview & Design Section matching front-end */}
                            <div className="space-y-4">
                                <Label className="text-sm font-bold flex items-center gap-2">
                                    <Eye className="w-4 h-4 text-red-600" />
                                    Live Vorschau & Design
                                </Label>

                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group/mpreview">
                                    {/* Mock Banner Area */}
                                    <div
                                        className="w-full h-24 md:h-32 relative bg-gray-50 border-b border-gray-100 flex items-center justify-center overflow-hidden cursor-pointer"
                                        onClick={() => mBannerInputRef.current?.click()}
                                    >
                                        {manufacturerFormData.banner_url ? (
                                            <>
                                                <img
                                                    src={manufacturerFormData.banner_url}
                                                    alt="Banner Live Preview"
                                                    className="w-full h-full object-cover"
                                                    style={{ objectPosition: manufacturerFormData.banner_position || '50% 50%' }}
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/mpreview:opacity-100 transition-opacity">
                                                    <Upload className="w-6 h-6 text-white" />
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-center gap-2 text-gray-400 group-hover/mpreview:text-red-500 transition-colors">
                                                <ImagePlus className="w-8 h-8" />
                                                <span className="text-[10px] uppercase font-bold tracking-widest">Banner hochladen</span>
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            ref={mBannerInputRef}
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) => handleManufacturerUpload(e, 'banner_url')}
                                        />
                                    </div>

                                    {/* Logo & Info Layout mimicking ManufacturerDetail */}
                                    <div className="px-6 pb-6 pt-0">
                                        <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
                                            {/* Overlapping Logo */}
                                            <div
                                                className="relative z-10 -mt-10 flex-shrink-0 cursor-pointer"
                                                onClick={() => mLogoInputRef.current?.click()}
                                            >
                                                <div className="w-24 h-24 md:w-28 md:h-28 bg-white rounded-lg shadow-xl flex items-center justify-center p-3 border border-gray-100 overflow-hidden hover:border-red-500 transition-colors">
                                                    {manufacturerFormData.logo_url ? (
                                                        <img
                                                            src={manufacturerFormData.logo_url}
                                                            alt="Logo Live Preview"
                                                            className="max-w-full max-h-full object-contain"
                                                        />
                                                    ) : (
                                                        <Upload className="w-6 h-6 text-gray-300" />
                                                    )}
                                                </div>
                                                <input
                                                    type="file"
                                                    ref={mLogoInputRef}
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={(e) => handleManufacturerUpload(e, 'logo_url')}
                                                />
                                            </div>

                                            {/* Mock Info Section */}
                                            <div className="text-center md:text-left pt-2 flex-1 min-w-0">
                                                <h4 className="text-xl font-black text-gray-900 truncate">
                                                    {manufacturerFormData.name || 'Herstellername'}
                                                </h4>
                                                <p className="text-[10px] text-gray-400 font-mono truncate uppercase tracking-tighter mb-2">
                                                    {manufacturerFormData.website || 'Keine Website hinterlegt'}
                                                </p>
                                                {manufacturerFormData.description && (
                                                    <p className="text-[10px] text-gray-500 line-clamp-2 leading-relaxed max-w-xs">
                                                        {manufacturerFormData.description.replace(/<[^>]*>?/gm, '')}
                                                    </p>
                                                )}
                                                <div className="mt-3 flex gap-1 justify-center md:justify-start">
                                                    <div className="w-6 h-1 bg-red-600 rounded-full" />
                                                    <div className="w-2 h-1 bg-red-600/30 rounded-full" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Controls when banner exists */}
                                {manufacturerFormData.banner_url && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50/50 p-4 rounded-xl border border-dashed border-gray-200">
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-[10px] font-bold uppercase text-gray-500">Horizontale Fokus (X)</Label>
                                                <span className="text-[10px] font-mono bg-white px-1.5 rounded">{(manufacturerFormData.banner_position || '50% 50%').split(' ')[0]}</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                step="1"
                                                value={parseInt((manufacturerFormData.banner_position || '50% 50%').split(' ')[0]) || 50}
                                                onChange={(e) => {
                                                    const pos = manufacturerFormData.banner_position || '50% 50%';
                                                    const y = pos.split(' ')[1] || '50%';
                                                    setManufacturerFormData({ ...manufacturerFormData, banner_position: `${e.target.value}% ${y}` });
                                                }}
                                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-[10px] font-bold uppercase text-gray-500">Vertikaler Fokus (Y)</Label>
                                                <span className="text-[10px] font-mono bg-white px-1.5 rounded">{(manufacturerFormData.banner_position || '50% 50%').split(' ')[1]}</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                step="1"
                                                value={parseInt((manufacturerFormData.banner_position || '50% 50%').split(' ')[1]) || 50}
                                                onChange={(e) => {
                                                    const pos = manufacturerFormData.banner_position || '50% 50%';
                                                    const x = pos.split(' ')[0] || '50%';
                                                    setManufacturerFormData({ ...manufacturerFormData, banner_position: `${x} ${e.target.value}%` });
                                                }}
                                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                                            />
                                        </div>
                                        <div className="md:col-span-2 flex justify-between gap-4 pt-1">
                                            <p className="text-[9px] text-gray-400 italic">Nutzen Sie die Regler, um den Fokuspunkt des Banners genau festzulegen.</p>
                                            <button
                                                onClick={() => setManufacturerFormData(prev => ({ ...prev, banner_url: '', banner_position: '50% 50%' }))}
                                                className="text-[9px] font-bold text-red-600 hover:underline uppercase"
                                            >
                                                Banner entfernen
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address">Adresse</Label>
                                <Input
                                    id="address"
                                    value={manufacturerFormData.address}
                                    onChange={(e) => setManufacturerFormData({ ...manufacturerFormData, address: e.target.value })}
                                    placeholder="Straße und Hausnummer"
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="zip_code">PLZ</Label>
                                    <Input
                                        id="zip_code"
                                        value={manufacturerFormData.zip_code}
                                        onChange={(e) => setManufacturerFormData({ ...manufacturerFormData, zip_code: e.target.value })}
                                        placeholder="z.B. 72574"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="city">Stadt</Label>
                                    <Input
                                        id="city"
                                        value={manufacturerFormData.city}
                                        onChange={(e) => setManufacturerFormData({ ...manufacturerFormData, city: e.target.value })}
                                        placeholder="z.B. Bad Urach"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="country">Land</Label>
                                    <Input
                                        id="country"
                                        value={manufacturerFormData.country}
                                        onChange={(e) => setManufacturerFormData({ ...manufacturerFormData, country: e.target.value })}
                                        placeholder="z.B. Deutschland"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center justify-between py-2 px-4 bg-gray-50 rounded-lg">
                                <Label className="flex flex-col">
                                    <span className="font-bold">Aktivitätsstatus</span>
                                    <span className="text-[10px] text-gray-500">Sichtbarkeit des Herstellers auf der Webseite</span>
                                </Label>
                                <div className="flex items-center gap-3">
                                    <span className={`text-xs font-bold uppercase ${manufacturerFormData.is_active ? 'text-green-600' : 'text-gray-400'}`}>
                                        {manufacturerFormData.is_active ? 'Aktiv' : 'Inaktiv'}
                                    </span>
                                    <button
                                        onClick={() => setManufacturerFormData(prev => ({ ...prev, is_active: !prev.is_active }))}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${manufacturerFormData.is_active ? 'bg-green-600' : 'bg-gray-300'}`}
                                    >
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${manufacturerFormData.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Beschreibung</Label>
                                <div className="quill-dark-container">
                                    <ReactQuill
                                        theme="snow"
                                        value={manufacturerFormData.description || ''}
                                        modules={{
                                            toolbar: [
                                                ['bold', 'italic', 'underline'],
                                                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                                ['link', 'clean']
                                            ]
                                        }}
                                        onChange={(content) => setManufacturerFormData(prev => ({ ...prev, description: content }))}
                                        placeholder="Kurze Beschreibung des Herstellers..."
                                    />
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsManufacturerModalOpen(false)}>
                                Abbrechen
                            </Button>
                            <Button
                                onClick={handleSaveManufacturer}
                                className="bg-red-600 hover:bg-red-700"
                                disabled={isSubmitting || !manufacturerFormData.name}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Speichern...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        Speichern
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        );
    };

    const renderArtikelStatistik = () => {
        return (
            <div className="space-y-8">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-100 italic">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                                    <ShoppingCart className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm text-blue-600 font-bold uppercase tracking-wider">Top-Seller</p>
                                    <h4 className="text-lg font-black text-gray-900 truncate max-w-[200px]">
                                        {artikelStats.topSold[0]?.name || '---'}
                                    </h4>
                                    <p className="text-xs text-gray-500">{artikelStats.topSold[0]?.quantity || 0} mal verkauft</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-100 italic">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
                                    <Eye className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm text-purple-600 font-bold uppercase tracking-wider">Beliebteste Artikel</p>
                                    <h4 className="text-lg font-black text-gray-900 truncate max-w-[200px]">
                                        {artikelStats.topClicked[0]?.name || '---'}
                                    </h4>
                                    <p className="text-xs text-gray-500">{artikelStats.topClicked[0]?.views || 0} Aufrufe</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Top Selling List */}
                    <Card>
                        <CardHeader className="border-b border-gray-100">
                            <CardTitle className="text-base flex items-center justify-between">
                                <span>Meistverkaufte Artikel</span>
                                <Badge variant="secondary">{artikelStats.topSold.length} Artikel</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-gray-100">
                                {artikelStats.topSold.slice(0, 10).map((item, idx) => (
                                    <div key={item.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                                        <div className="w-6 h-6 flex items-center justify-center text-xs font-black text-gray-400">
                                            {idx + 1}
                                        </div>
                                        <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                                            <img src={item.image} alt="" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-sm text-gray-900 truncate">{item.name}</p>
                                            <p className="text-[10px] text-gray-500 uppercase tracking-tighter">
                                                Umsatz: {item.revenue.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-black text-red-600">{item.quantity}</div>
                                            <div className="text-[10px] text-gray-400 uppercase font-bold">Verkäufe</div>
                                        </div>
                                    </div>
                                ))}
                                {artikelStats.topSold.length === 0 && (
                                    <div className="p-8 text-center text-gray-400">Keine Daten verfügbar</div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Top Clicked List */}
                    <Card>
                        <CardHeader className="border-b border-gray-100">
                            <CardTitle className="text-base flex items-center justify-between">
                                <span>Meistgeklickte Artikel</span>
                                <Badge variant="secondary">Basierend auf Klicks</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-gray-100">
                                {artikelStats.topClicked.slice(0, 10).map((item, idx) => (
                                    <div key={item.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                                        <div className="w-6 h-6 flex items-center justify-center text-xs font-black text-gray-400">
                                            {idx + 1}
                                        </div>
                                        <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                                            <img src={item.image} alt="" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-sm text-gray-900 truncate">{item.name}</p>
                                            <p className="text-[10px] text-gray-500 uppercase tracking-tighter">
                                                Preis: {item.price?.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <Eye className="w-3.5 h-3.5 text-purple-400" />
                                                <div className="text-sm font-black text-purple-600">{item.views || 0}</div>
                                            </div>
                                            <div className="text-[10px] text-gray-400 uppercase font-bold">Aufrufe</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    };

    const renderStatistiken = () => {
        return (
            <div className="space-y-8 animate-in fade-in duration-500">
                {statsTab === 'artikel' && renderArtikelStatistik()}
                {statsTab === 'umsatz' && renderUmsatzStatistik()}
                {statsTab === 'online' && renderOnlineUsers()}
                {statsTab === 'kunden' && (
                    <div className="p-20 text-center bg-white rounded-lg border-2 border-dashed border-gray-100 italic">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users className="w-8 h-8 text-gray-200" />
                        </div>
                        <h4 className="text-gray-900 font-black uppercase tracking-widest mb-1">Kunden-Analyse</h4>
                        <p className="text-gray-400 text-sm font-medium">Dieses Modul wird in der nächsten Version freigeschaltet.</p>
                    </div>
                )}
            </div>
        );
    };

    const renderOnlineUsers = () => {
        const formatTime = (isoString) => {
            if (!isoString) return '--:--:--';
            return new Date(isoString).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        };

        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
                        Wer ist online?
                        <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">{onlineUsers.length} Aktiv</span>
                    </h3>
                    <div className="flex items-center gap-4">
                        {onlineLoading && <div className="text-xs text-gray-400 flex items-center gap-2"><div className="w-3 h-3 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div>}
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Klicken Sie auf eine Zeile für Details</p>
                    </div>
                </div>

                <div className="flex gap-6 h-[650px]">
                    {/* Table Container - Fixed width/proportions */}
                    <div className="flex-[2] bg-white rounded-xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden flex flex-col">
                        <div className="h-full overflow-y-auto custom-scrollbar">
                            <table className="w-full border-collapse sticky-header">
                                <thead className="sticky top-0 z-10">
                                    <tr className="bg-gray-900 border-b border-gray-800">
                                        <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">online</th>
                                        <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Letzte URL</th>
                                        <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Name</th>
                                        <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest pl-10 border-l border-white/10">Warenkorb</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {onlineUsers.map((user) => (
                                        <tr
                                            key={user.session_id}
                                            onClick={() => setSelectedOnlineUser(user)}
                                            className={`hover:bg-indigo-50/50 transition-colors group cursor-pointer ${selectedOnlineUser?.session_id === user.session_id ? 'bg-indigo-50' : ''}`}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-black text-gray-900">{formatTime(user.last_activity)}</span>
                                                    <span className="text-[10px] text-gray-400 font-bold uppercase">{user.ip_address || '---.---.---.---'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-0.5 max-w-[180px]">
                                                    <span className="text-[11px] font-medium text-gray-700 truncate font-mono bg-gray-50 px-1 py-0.5 rounded border border-gray-100" title={user.last_url}>
                                                        {user.last_url}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`text-xs font-black p-0 px-0 rounded ${user.user_name === 'Guest' ? 'text-gray-500' : 'text-red-600'}`}>
                                                    {user.user_name}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right border-l border-gray-50">
                                                <div className="flex items-center justify-end gap-2">
                                                    {user.cart_items_count > 0 ? (
                                                        <div className="flex items-center gap-1.5 px-2 py-1 bg-red-50 text-red-600 rounded-lg border border-red-100 scale-95 origin-right">
                                                            <ShoppingCart className="w-3.5 h-3.5" />
                                                            <span className="text-xs font-black">{user.cart_items_count}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-[10px] text-gray-300 font-bold uppercase">Leer</span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {onlineUsers.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-20 text-center">
                                                <div className="flex flex-col items-center justify-center grayscale opacity-30">
                                                    <Globe className="w-12 h-12 text-gray-400 mb-4" />
                                                    <p className="text-sm font-black text-gray-500 uppercase tracking-widest">Keine aktiven Besucher</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Detail Sidebar Container - Always Static Now */}
                    <div className="flex-1 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden flex flex-col">
                        {selectedOnlineUser ? (
                            <div className="flex flex-col h-full animate-in fade-in duration-300">
                                {/* Header */}
                                <div className="bg-gray-900 p-6 text-white">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center text-xl font-black">
                                            {selectedOnlineUser.user_name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h4 className="font-black text-lg leading-tight">{selectedOnlineUser.user_name}</h4>
                                            <p className="text-indigo-300 text-[10px] font-black uppercase tracking-widest">Besucher Details</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 mt-6">
                                        <div className="bg-white/10 p-3 rounded-lg border border-white/10">
                                            <p className="text-[9px] text-indigo-200 font-bold uppercase mb-1">Startzeit</p>
                                            <p className="text-sm font-black font-mono">{formatTime(selectedOnlineUser.start_time)}</p>
                                        </div>
                                        <div className="bg-white/10 p-3 rounded-lg border border-white/10">
                                            <p className="text-[9px] text-indigo-200 font-bold uppercase mb-1">Letzter Klick</p>
                                            <p className="text-sm font-black font-mono">{formatTime(selectedOnlineUser.last_activity)}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Info Section */}
                                <div className="p-6 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
                                    <div>
                                        <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                            <MapPin className="w-3 h-3" /> System Info
                                        </h5>
                                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-gray-500 font-bold">IP-Adresse</span>
                                                <span className="font-mono font-black text-gray-900">{selectedOnlineUser.ip_address}</span>
                                            </div>
                                            <div className="flex flex-col gap-1 text-xs">
                                                <span className="text-gray-500 font-bold">Aktuelle Seite</span>
                                                <span className="font-mono text-indigo-600 font-bold bg-white p-2 rounded border border-indigo-50 truncate text-[11px]">
                                                    {selectedOnlineUser.last_url}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Cart Section */}
                                    <div>
                                        <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                            <ShoppingCart className="w-3 h-3" /> Warenkorb Inhalt
                                        </h5>
                                        {selectedOnlineUser.cart_data && selectedOnlineUser.cart_data.length > 0 ? (
                                            <div className="space-y-2">
                                                {selectedOnlineUser.cart_data.map((item, i) => (
                                                    <div key={i} className="bg-white border border-gray-100 rounded-lg p-3 flex justify-between items-center gap-3 hover:shadow-md transition-shadow">
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs font-black text-gray-900 truncate mb-0.5">{item.name}</p>
                                                            <p className="text-[10px] text-gray-500 font-bold uppercase">{item.qty} Stück × {Number(item.price).toLocaleString('de-DE')} €</p>
                                                        </div>
                                                        <div className="text-xs font-black text-gray-900">
                                                            {(item.qty * item.price).toLocaleString('de-DE')} €
                                                        </div>
                                                    </div>
                                                ))}
                                                <div className="mt-4 p-4 bg-red-600 rounded-xl text-white flex justify-between items-center shadow-lg shadow-red-100">
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Warenkorb Gesamtwert</span>
                                                    <span className="text-xl font-black">
                                                        {selectedOnlineUser.cart_data.reduce((sum, item) => sum + (item.qty * item.price), 0).toLocaleString('de-DE')} €
                                                    </span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="bg-gray-50 rounded-lg p-10 text-center border-2 border-dashed border-gray-200">
                                                <ShoppingCart className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Keine Artikel im Warenkorb</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* Empty State Placeholder - Sidebar is always there but showing this */
                            <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-gray-50/50">
                                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl mb-6 ring-8 ring-indigo-50/50">
                                    <User className="w-10 h-10 text-indigo-400" />
                                </div>
                                <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-2">Kein Profil ausgewählt</h4>
                                <p className="text-xs text-gray-500 font-medium max-w-[200px]">Wählen Sie einen Besucher aus der Liste aus, um Details und Warenkorb zu sehen.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const renderUmsatzStatistik = () => {
        const maxRevenue = Math.max(...revenueStats.map(d => d.revenue), 100);

        return (
            <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <Card className="lg:col-span-3 overflow-hidden border-none shadow-xl shadow-gray-200/50">
                        <CardHeader className="bg-gray-900 text-white p-8">
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2">Finanzielle Performance</p>
                                    <CardTitle className="text-3xl font-black">Umsatzkurve (7 Tage)</CardTitle>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs font-black text-green-400 uppercase mb-1">Durchschnitt</div>
                                    <div className="text-2xl font-black">
                                        {(revenueStats.reduce((s, r) => s + r.revenue, 0) / 7).toLocaleString('de-DE', { maximumFractionDigits: 0 })} €
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8">
                            <div className="h-64 flex items-end justify-between gap-4 mt-4">
                                {revenueStats.map((data, idx) => {
                                    const height = (data.revenue / maxRevenue) * 100;
                                    return (
                                        <div key={idx} className="flex-1 flex flex-col items-center group relative">
                                            {/* Tooltip */}
                                            <div className="absolute -top-12 bg-gray-900 text-white px-3 py-1.5 rounded-lg text-xs font-black opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-10 whitespace-nowrap shadow-xl">
                                                {data.revenue.toLocaleString('de-DE')} €
                                            </div>

                                            <div
                                                className={`w-full max-w-[40px] rounded-t-xl transition-all duration-700 ease-out cursor-pointer relative overflow-hidden ${data.revenue === maxRevenue ? 'bg-red-600' : 'bg-gray-100 group-hover:bg-red-200'
                                                    }`}
                                                style={{ height: `${height}%` }}
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent"></div>
                                            </div>
                                            <div className="mt-4 flex flex-col items-center">
                                                <span className="text-[10px] font-black text-gray-900 uppercase">{data.day}</span>
                                                <span className="text-[8px] font-bold text-gray-400">{data.date.split('.')[0]}.{data.date.split('.')[1]}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-6">
                        <Card className="bg-red-600 text-white border-none shadow-xl shadow-red-200/50">
                            <CardContent className="p-6">
                                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mb-4 text-white">
                                    <Zap className="w-5 h-5" />
                                </div>
                                <p className="text-red-100 text-[10px] font-black uppercase tracking-widest mb-1">Heute</p>
                                <h4 className="text-3xl font-black">{revenueStats[6].revenue.toLocaleString('de-DE')} €</h4>
                                <div className="mt-4 p-2 bg-white/10 rounded-lg text-[10px] font-bold flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                                    Online • {revenueStats[6].count} Bestellungen
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-xl shadow-gray-200/50 italic">
                            <CardContent className="p-6">
                                <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-4">Besucher-Metriken</p>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-gray-600">Gesamtbesucher</span>
                                        <span className="text-sm font-black text-gray-900">
                                            {visitorsLoading ? '...' : visitorStats.total.toLocaleString('de-DE')}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-gray-600">Besucher (Heute)</span>
                                        <span className="text-sm font-black text-red-600">
                                            {visitorsLoading ? '...' : visitorStats.today.toLocaleString('de-DE')}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-gray-600">Öy. Verweildauer</span>
                                        <span className="text-sm font-black text-gray-900">3:45m</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        );
    };

    const renderWarehouse = () => {
        const warehouseSearch = productSearch.toLowerCase();
        let filteredProducts = products.filter(p =>
            p.name.toLowerCase().includes(warehouseSearch) ||
            (p.sku && p.sku.toLowerCase().includes(warehouseSearch))
        );

        if (showOnlyWarehouse) {
            filteredProducts = filteredProducts.filter(p => Number(p.warehouse_stock || 0) > 0);
        }

        const totalWarehouseItems = products.reduce((sum, p) => sum + Number(p.warehouse_stock || 0), 0);
        const totalOnlineItems = products.reduce((sum, p) => sum + Number(p.stock || 0), 0);

        const warehouseOnlyProducts = products.filter(p => Number(p.warehouse_stock || 0) > 0);
        const warehouseTotalSum = warehouseOnlyProducts.reduce((sum, p) => sum + Number(p.warehouse_stock || 0), 0);
        const lowStockProducts = products.filter(p => Number(p.warehouse_stock || 0) > 0 && Number(p.warehouse_stock || 0) <= 5);

        return (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
                {/* Gemini AI Header Banner */}
                <div className="relative overflow-hidden rounded-lg bg-[#0f0c29] bg-gradient-to-r from-[#0f0c29] via-[#302b63] to-[#24243e] p-8 shadow-2xl border border-white/10 group mb-8 print:hidden">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                    <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-blue-500 rounded-full blur-[100px] opacity-30 animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-purple-500 rounded-full blur-[100px] opacity-30 animate-[pulse_4s_cubic-bezier(0.4,0,0.6,1)_infinite] delay-1000"></div>

                    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="flex items-start gap-5">
                            <div className="w-14 h-14 rounded-lg bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white shadow-lg overflow-hidden relative">
                                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-purple-500 opacity-50 animate-[spin_8s_linear_infinite]"></div>
                                <Activity className="w-7 h-7 relative z-10 text-white" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h2 className="text-2xl font-black text-white tracking-tight">Gemini Inventar-Einblicke</h2>
                                    <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-none py-0.5 px-2 uppercase text-[9px] font-black tracking-widest shadow-lg">KI AKTIV</Badge>
                                </div>
                                <p className="text-blue-100/70 text-sm font-medium">Analyse von Lagerbewegungen und Optimierung der Lagerverteilung.</p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-4 flex flex-col items-center justify-center min-w-[120px]">
                                <span className="text-blue-200 text-xs font-bold uppercase tracking-wider mb-1">Optimaler Lagerbestand</span>
                                <span className="text-2xl font-black text-white">{warehouseOnlyProducts.length} <span className="text-sm font-medium text-white/50">SKUs</span></span>
                            </div>
                            <div className="bg-orange-500/10 backdrop-blur-md border border-orange-500/20 rounded-lg p-4 flex flex-col items-center justify-center min-w-[120px]">
                                <span className="text-orange-200 text-xs font-bold uppercase tracking-wider mb-1">Niedriger Bestand (Alarm)</span>
                                <span className="text-2xl font-black text-orange-400">{lowStockProducts.length} <span className="text-sm font-medium text-orange-400/50">SKUs</span></span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search & Statistics Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 print:hidden">
                    <div className="lg:col-span-1">
                        <div className="relative group h-full">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                            <div className="relative h-full flex items-center bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all">
                                <div className="pl-5 pt-1">
                                    <Search className="h-5 w-5 text-indigo-400 group-focus-within:text-indigo-600 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Intelligente Artikelsuche..."
                                    className="block w-full h-full pl-3 pr-4 py-4 md:py-5 border-none bg-transparent focus:ring-0 text-sm font-medium text-gray-700 placeholder:text-gray-400 outline-none"
                                    value={productSearch}
                                    onChange={(e) => setProductSearch(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center gap-5 relative overflow-hidden group hover:shadow-md transition-all">
                        <div className="absolute right-0 top-0 w-24 h-24 bg-blue-50 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-blue-100 transition-colors"></div>
                        <div className="w-14 h-14 bg-blue-50/80 text-blue-600 rounded-lg flex items-center justify-center relative z-10 border border-blue-100/50 shadow-sm">
                            <Warehouse className="w-6 h-6" />
                        </div>
                        <div className="relative z-10">
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-0.5">Lagerbestands-Einheiten</p>
                            <h4 className="text-2xl font-black text-gray-900 leading-none">{totalWarehouseItems.toLocaleString()}</h4>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center gap-5 relative overflow-hidden group hover:shadow-md transition-all">
                        <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-50 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-emerald-100 transition-colors"></div>
                        <div className="w-14 h-14 bg-emerald-50/80 text-emerald-600 rounded-lg flex items-center justify-center relative z-10 border border-emerald-100/50 shadow-sm">
                            <Globe className="w-6 h-6" />
                        </div>
                        <div className="relative z-10">
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-0.5">Online-Bestand</p>
                            <h4 className="text-2xl font-black text-gray-900 leading-none">{totalOnlineItems.toLocaleString()}</h4>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowOnlyWarehouse(!showOnlyWarehouse)}
                        className={`p-6 rounded-lg shadow-sm border transition-all flex items-center gap-5 text-left group relative overflow-hidden ${showOnlyWarehouse
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-indigo-200/50'
                            : 'bg-white border-gray-100 hover:border-indigo-100 text-gray-900 hover:shadow-md'
                            }`}
                    >
                        {showOnlyWarehouse && <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-500 rounded-full blur-2xl -mr-10 -mt-10"></div>}
                        <div className={`w-14 h-14 rounded-lg flex items-center justify-center transition-colors relative z-10 ${showOnlyWarehouse ? 'bg-white/20 backdrop-blur border border-white/10' : 'bg-gray-50 border border-gray-100 text-indigo-500 shadow-sm'}`}>
                            <Activity className={`w-6 h-6 ${showOnlyWarehouse ? 'text-white' : ''}`} />
                        </div>
                        <div className="relative z-10">
                            <p className={`text-[10px] font-black uppercase tracking-widest mb-0.5 ${showOnlyWarehouse ? 'text-indigo-100' : 'text-gray-500'}`}>Aktive Bestände filtern</p>
                            <h4 className={`text-2xl font-black leading-none ${showOnlyWarehouse ? 'text-white' : 'text-gray-900'}`}>{warehouseTotalSum.toLocaleString()}</h4>
                        </div>
                    </button>
                </div>

                {/* Main Data Table */}
                <div className="bg-white rounded-lg shadow-xl shadow-gray-200/40 border border-gray-100 overflow-hidden">
                    <div className="px-8 py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gray-50/50 border-b border-gray-100 print:hidden relative overflow-hidden">
                        <div className="absolute right-0 top-0 w-64 h-64 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
                        <div className="flex items-center gap-5 relative z-10">
                            <div className="w-12 h-12 bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg flex items-center justify-center text-white shadow-md">
                                <Layers className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-gray-900 tracking-tight">Erweiterte Bestandsverwaltung</h3>
                                <p className="text-xs text-indigo-600 font-bold uppercase tracking-widest mt-0.5">Echtzeit-Lager-Synchronisation</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 relative z-10">
                            {showOnlyWarehouse && (
                                <Badge className="bg-indigo-100 text-indigo-700 border-none font-black text-[10px] uppercase px-3 py-1.5 rounded-lg">
                                    Filter: Nur vorhandene Artikel
                                </Badge>
                            )}
                            <Button
                                onClick={() => window.print()}
                                className="bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 rounded-lg px-5 h-12 text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-sm group"
                            >
                                <Printer className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                                Liste exportieren
                            </Button>
                        </div>
                    </div>

                    <div className="overflow-x-auto print:overflow-visible">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-white border-b border-gray-100 print:bg-gray-100">
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest w-[300px]">Produkt-Identität</th>
                                    <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Referenz (SKU)</th>
                                    <th className="px-6 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest print:hidden">Online Best.</th>
                                    <th className="px-6 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest print:hidden">Status</th>
                                    <th className="px-8 py-5 text-center text-[10px] font-black tracking-widest bg-indigo-50/50 text-indigo-600 border-x border-indigo-100 print:bg-white print:border-gray-300 print:text-gray-900">Lagerbestand (Ziel)</th>
                                    <th className="px-8 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest hidden print:table-cell border-r border-gray-200">Physische Zählung</th>
                                    <th className="px-6 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest hidden print:table-cell">Bestätigen</th>
                                    <th className="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest print:hidden">Aktionen</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredProducts.map((p, idx) => {
                                    const inWarehouse = Number(p.warehouse_stock || 0);
                                    let statusObj = { label: 'Optimal', color: 'bg-emerald-50 text-emerald-600 border-emerald-200', dot: 'bg-emerald-500' };
                                    if (inWarehouse === 0) {
                                        statusObj = { label: 'Aufgebraucht', color: 'bg-red-50 text-red-600 border-red-200', dot: 'bg-red-500' };
                                    } else if (inWarehouse < 5) {
                                        statusObj = { label: 'Kritisch', color: 'bg-orange-50 text-orange-600 border-orange-200', dot: 'bg-orange-500 animate-pulse' };
                                    }

                                    return (
                                        <tr key={p.id} className="hover:bg-gray-50/60 transition-colors duration-200 group print:border-b-2">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-lg bg-white shadow-sm border border-gray-100 flex-shrink-0 relative overflow-hidden print:border-none print:shadow-none">
                                                        {p.image ? (
                                                            <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300"><ImageIcon className="w-5 h-5" /></div>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col gap-1 min-w-0">
                                                        <span className="font-bold text-gray-900 text-sm tracking-tight truncate group-hover:text-indigo-600 transition-colors cursor-pointer" onClick={() => navigate(`/product/${p.slug || p.id}`)}>{p.name}</span>
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{p.categories?.name || 'Nicht kategorisiert'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="inline-flex items-center px-2.5 py-1 rounded bg-gray-100/80 text-gray-600 text-xs font-mono font-medium border border-gray-200/80">
                                                    {p.sku || <span className="text-gray-400 italic">KEINE SKU</span>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-center print:hidden">
                                                <div className="flex flex-col items-center">
                                                    <div className={`px-3 py-1 rounded-lg font-bold text-sm ${Number(p.stock) === 0 ? 'bg-gray-100 text-gray-400' : 'bg-blue-50 text-blue-700'}`}>
                                                        {p.stock || 0}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-center print:hidden">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusObj.color}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${statusObj.dot}`}></span>
                                                    {statusObj.label}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-center bg-indigo-50/30 border-x border-indigo-50/50 group-hover:bg-indigo-50/60 transition-colors print:bg-white print:border-gray-200">
                                                <span className={`text-xl font-black ${inWarehouse === 0 ? 'text-red-500' : 'text-indigo-900'} print:text-lg`}>
                                                    {inWarehouse}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 hidden print:table-cell border-r border-gray-200 text-center">
                                                <div className="w-20 h-10 border-2 border-gray-300 rounded mx-auto"></div>
                                            </td>
                                            <td className="px-6 py-5 hidden print:table-cell text-center">
                                                <div className="w-full flex items-center justify-center">
                                                    <div className="w-5 h-5 border-2 border-gray-300 rounded"></div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-right print:hidden">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                    <button
                                                        onClick={() => openProductModal(p)}
                                                        className="w-9 h-9 flex items-center justify-center bg-white text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg border border-gray-200 hover:border-indigo-200 shadow-sm transition-all"
                                                        title="Produkt bearbeiten"
                                                    >
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteProduct(p.id)}
                                                        className="w-9 h-9 flex items-center justify-center bg-white text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg border border-gray-200 hover:border-red-200 shadow-sm transition-all"
                                                        title="Produkt löschen"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filteredProducts.length === 0 && (
                                    <tr>
                                        <td colSpan="8" className="px-6 py-24 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center text-gray-300 mb-4 ring-8 ring-gray-50/50">
                                                    <Package className="w-8 h-8" />
                                                </div>
                                                <h4 className="text-base font-bold text-gray-900 mb-1">Kein Inventar gefunden</h4>
                                                <p className="text-gray-500 text-sm max-w-sm mb-6">Wir konnten keine Produkte finden, die Ihrer aktuellen Suche oder Ihren Filtereinstellungen entsprechen.</p>
                                                <Button
                                                    variant="outline"
                                                    onClick={() => { setProductSearch(''); setShowOnlyWarehouse(false); }}
                                                    className="rounded-lg font-bold"
                                                >
                                                    Alle Filter zurücksetzen
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div >
        );
    };

    const renderInvoiceDialog = () => {
        if (!selectedOrder) return null;

        const invoiceNumber = selectedOrder.invoice_number ? `RE-${selectedOrder.invoice_number}` : `RE-${selectedOrder.id.slice(0, 8).toUpperCase()}`;
        const totalAmount = Number(selectedOrder.total_amount);
        const subtotalWithVat = orderItems.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
        const shipping = Math.max(0, totalAmount - subtotalWithVat);

        // MwSt Berechnung (19% inkludiert)
        const vatRate = 0.19;
        const netTotal = totalAmount / (1 + vatRate);
        const vatAmount = totalAmount - netTotal;

        const formatCurrency = (val) => Number(val).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        return (
            <Dialog open={isInvoiceModalOpen} onOpenChange={setIsInvoiceModalOpen}>
                <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col p-0 rounded-lg border-none shadow-2xl">
                    <DialogHeader className="p-6 bg-gray-50/50 border-b flex-row items-center justify-between space-y-0 text-left">
                        <div>
                            <DialogTitle className="text-xl font-black text-gray-900 flex items-center gap-2">
                                <Scroll className="w-5 h-5 text-red-600" />
                                {invoiceEditMode ? 'Rechnung bearbeiten' : 'Rechnungsdetails'}
                            </DialogTitle>
                            <p className="text-xs text-gray-500 font-medium mt-0.5">{invoiceNumber} • {new Date(selectedOrder.created_at).toLocaleDateString('de-DE')}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant={isInvoiceStorniert ? "destructive" : "outline"}
                                size="sm"
                                className={`h-8 text-[10px] font-bold uppercase tracking-wider ${isInvoiceStorniert ? 'bg-red-600 text-white' : ''}`}
                                onClick={() => setIsInvoiceStorniert(!isInvoiceStorniert)}
                            >
                                {isInvoiceStorniert ? 'Storniert' : 'Stornieren'}
                            </Button>
                            <Button size="sm" onClick={handleDownloadInvoice} disabled={isSubmitting} className="h-8 bg-black hover:bg-zinc-800 text-white text-[10px] font-bold uppercase tracking-wider gap-2">
                                {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                                Download (PDF)
                            </Button>
                            <Button size="sm" onClick={handlePrintInvoice} className="h-8 bg-black hover:bg-zinc-800 text-white text-[10px] font-bold uppercase tracking-wider gap-2">
                                <Printer className="w-3.5 h-3.5" />
                                Drucken
                            </Button>
                        </div>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto bg-zinc-100/50 p-8">
                        <div id="invoice-preview-content" className="bg-white shadow-sm border border-gray-200 rounded-lg p-10 max-w-[600px] mx-auto min-h-[850px] relative overflow-hidden">
                            {isInvoiceStorniert && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                                    <div className="border-[8px] border-red-500/30 text-red-500/30 text-[80px] font-black transform -rotate-[35deg] px-8 py-4 rounded-lg uppercase tracking-[10px]">
                                        Storniert
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-between mb-12">
                                <div className="text-left">
                                    {shopSettings?.logoUrl ? (
                                        <img src={shopSettings.logoUrl} className="h-10 object-contain mb-3" alt="Logo" />
                                    ) : (
                                        <div className="text-2xl font-black text-red-600 tracking-tighter uppercase mb-2">{shopSettings?.shopName || 'ELECTRIVE'}</div>
                                    )}
                                    <div className="text-[10px] text-gray-400 font-bold leading-tight uppercase">
                                        <p className="text-gray-900">{shopSettings?.companyName || shopSettings?.shopName || 'ELECTRIVE GmbH'}</p>
                                        <p>{shopSettings?.companyStreet || 'Musterweg 12'}</p>
                                        <p>{shopSettings?.companyZip || '72574'} {shopSettings?.companyCity || 'Bad Urach'}</p>
                                        <p>{shopSettings?.companyCountry || 'DEUTSCHLAND'}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <h2 className="text-3xl font-black text-gray-900 leading-none mb-2">RECHNUNG</h2>
                                    <p className="text-sm font-bold text-gray-500">{invoiceNumber}</p>
                                    <p className="text-sm text-gray-900 font-bold">{new Date(selectedOrder.created_at).toLocaleDateString('de-DE')}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8 mb-12">
                                <div className="text-left">
                                    <span className="text-[10px] font-bold text-gray-900 uppercase tracking-widest block mb-1">Empfänger</span>
                                    <p className="font-bold text-gray-900 text-sm">{orderCustomer ? (orderCustomer.first_name ? `${orderCustomer.first_name} ${orderCustomer.last_name}` : orderCustomer.name) : selectedOrder.customer_name}</p>
                                    <p className="text-[11px] text-gray-600 leading-tight mt-1">{orderCustomer?.address_street || selectedOrder.street || '---'}</p>
                                    <p className="text-[11px] text-gray-600 font-medium leading-tight">{orderCustomer?.address_zip || selectedOrder.zip} {orderCustomer?.address_city || selectedOrder.city}</p>
                                    <p className="text-[9px] font-bold text-gray-400 uppercase mt-1">{orderCustomer?.address_country || selectedOrder.country || 'Deutschland'}</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] font-bold text-gray-900 uppercase tracking-widest block mb-1">Zahlungsinfo</span>
                                    <p className="text-[11px] font-bold text-gray-900">{selectedOrder.payment_method === 'paypal' ? 'PayPal' : (selectedOrder.payment_method || 'Überweisung / Vorkasse').toUpperCase()}</p>
                                    <p className="text-[10px] text-gray-500 mt-1">Bestell-ID: #{selectedOrder.id.slice(0, 8).toUpperCase()}</p>

                                    {selectedOrder.tracking_number && (
                                        <div className="mt-4">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Versandinfo</span>
                                            <p className="text-sm font-bold text-gray-900">{selectedOrder.shipping_carrier?.toUpperCase() || 'DHL'}</p>
                                            <p className="text-xs text-gray-500 font-mono mt-0.5">Tracking: {selectedOrder.tracking_number}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <table className="w-full mb-8">
                                <thead>
                                    <tr className="border-b-2 border-gray-900/5">
                                        <th className="text-left py-3 text-[10px] font-black uppercase text-gray-400">Position</th>
                                        <th className="text-center py-3 text-[10px] font-black uppercase text-gray-400">Menge</th>
                                        <th className="text-right py-3 text-[10px] font-black uppercase text-gray-400">Einzel</th>
                                        <th className="text-right py-3 text-[10px] font-black uppercase text-gray-400">Gesamt</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orderItems.map((item, idx) => (
                                        <tr key={item.id} className="border-b border-gray-50">
                                            <td className="py-4 text-left">
                                                <div className="flex items-start">
                                                    <span className="text-xs text-gray-400 mr-2 mt-1">{idx + 1}</span>
                                                    <div>
                                                        <div className="text-sm font-bold text-gray-900">{item.products?.name}</div>
                                                        {item.variant_name && (
                                                            <div className="text-[10px] font-bold text-gray-900 uppercase tracking-wider mt-1 border-l-2 border-red-600 pl-1.5 py-0.5">
                                                                {item.variant_name}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="text-center py-4 text-sm text-gray-500 font-medium">{item.quantity}</td>
                                            <td className="text-right py-4 text-sm text-gray-500 font-mono">{formatCurrency(item.price)} €</td>
                                            <td className="text-right py-4 text-sm font-black text-gray-900 font-mono">{formatCurrency(Number(item.price) * item.quantity)} €</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div className="flex justify-end mb-12">
                                <div className="w-64 space-y-2">
                                    <div className="flex justify-between text-[10px] text-gray-500">
                                        <span>Zwischensumme (Netto):</span>
                                        <span className="font-mono">{formatCurrency(netTotal - (shipping / (1 + vatRate)))} €</span>
                                    </div>
                                    <div className="flex justify-between text-[10px] text-gray-500">
                                        <span>Versand (Netto):</span>
                                        <span className="font-mono">{formatCurrency(shipping / (1 + vatRate))} €</span>
                                    </div>
                                    <div className="flex justify-between text-[10px] text-gray-500">
                                        <span>zzgl. 19% MwSt.:</span>
                                        <span className="font-mono">{formatCurrency(vatAmount)} €</span>
                                    </div>
                                    <div className="flex justify-between text-base font-black text-gray-900 pt-4 border-t-2 border-gray-900/5">
                                        <span>Gesamt (Brutto):</span>
                                        <span className="font-mono text-red-600">{formatCurrency(totalAmount)} €</span>
                                    </div>
                                </div>
                            </div>

                            {invoiceEditMode ? (
                                <div className="mt-8 pt-8 border-t border-dashed text-left">
                                    <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-3 text-left">Anmerkungen bearbeiten</Label>
                                    <textarea
                                        className="w-full h-24 p-4 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all placeholder:text-gray-300 italic"
                                        placeholder="Geben Sie hier zusätzliche Rechnungsnotizen ein..."
                                        value={invoiceNotes}
                                        onChange={(e) => setInvoiceNotes(e.target.value)}
                                    />
                                    <Button size="sm" onClick={() => setInvoiceEditMode(false)} className="mt-4 bg-zinc-900 text-white font-bold text-xs uppercase h-8 px-6 hover:bg-black">Speichern</Button>
                                </div>
                            ) : invoiceNotes && (
                                <div className="mt-8 pt-6 border-t border-dashed text-left">
                                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-1">Anmerkungen</span>
                                    <p className="text-xs text-gray-600 leading-relaxed italic pr-12">{invoiceNotes}</p>
                                </div>
                            )}

                            <div className="absolute bottom-8 left-10 right-10 flex justify-between items-start border-t pt-4 opacity-90 text-[9px] font-bold text-gray-700">
                                <div className="text-left space-y-0.5">
                                    <p className="text-gray-900 font-black">{shopSettings?.companyName || 'ELECTRIVE GmbH'}</p>
                                    <p>{shopSettings?.companyStreet || 'Musterweg 12'}</p>
                                    <p>{shopSettings?.companyZip || '72574'} {shopSettings?.companyCity || 'Bad Urach'}</p>
                                    <p>{shopSettings?.owner ? `GF: ${shopSettings.owner}` : 'CEO: K. Aydin'} | {shopSettings?.supportEmail}</p>
                                </div>
                                <div className="text-right space-y-0.5">
                                    <p>St.-Nr / USt-IdNr.: {shopSettings?.taxNumber || shopSettings?.vatId || 'DE 123 456 789'}</p>
                                    <p>Bank: {shopSettings?.bankName || 'Sparkasse'}</p>
                                    <p>IBAN: {shopSettings?.iban || 'DE12 3456 7890 0000 00'} | BIC: {shopSettings?.bic || 'EXVIGEM1XXX'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        );
    };

    const renderInvoices = () => {
        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Rechnungen</h2>
                        <p className="text-gray-500">Verwalten Sie hier alle Kundenrechnungen.</p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-red-600" />
                            Alle Rechnungen
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 border-b text-xs uppercase text-gray-500 font-bold">
                                    <tr>
                                        <th className="px-6 py-3">Rechnung</th>
                                        <th className="px-6 py-3">Datum</th>
                                        <th className="px-6 py-3">Kunde</th>
                                        <th className="px-6 py-3 text-right">Betrag</th>
                                        <th className="px-6 py-3 text-center">Status</th>
                                        <th className="px-6 py-3 text-right">Aktion</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {orders.map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-mono font-bold text-gray-900">
                                                {order.invoice_number ? `RE-${order.invoice_number}` : `RE-${order.id.slice(0, 8).toUpperCase()}`}
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                {new Date(order.created_at).toLocaleDateString('de-DE')}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-gray-900">
                                                {order.customer_name}
                                            </td>
                                            <td className="px-6 py-4 text-right font-black">
                                                {Number(order.total_amount).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <Badge variant={order.status === 'storniert' ? 'destructive' : 'outline'} className={order.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' : ''}>
                                                    {order.status === 'storniert' ? 'STORNIERT' : 'ERSTELLT'}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="hover:bg-gray-100 hover:text-gray-900"
                                                    onClick={async () => {
                                                        await handleViewOrder(order);
                                                        setIsInvoiceModalOpen(true);
                                                    }}
                                                >
                                                    <Eye className="w-4 h-4 mr-2" />
                                                    Ansehen
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'Bestellungen': return renderOrders();
            case 'Rechnungen': return renderInvoices();
            case 'Kunden': return renderCustomers();
            case 'Kategorien / Artikel': return renderProducts();
            case 'Hersteller': return renderManufacturers();
            case 'Depo / Inventur': return renderWarehouse();
            case 'Statistiken':
            case 'Artikelstatistik':
            case 'Umsatzstatistik':
            case 'Kundenstatistik':
            case 'Wer ist online?':
                return renderStatistiken();
            case 'Module': return renderModules();
            case 'Startseiten-Einstellungen': return renderHomeSettings();
            case 'Versand-Einstellungen': return renderShippingSettings();
            case 'Inhalt & Rechtliches': return renderFooterSettings();
            case 'Einstellungen': return renderSettings();
            case 'Übersicht':
            default: return renderOverview();
        }
    };

    const renderModules = () => (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* easyCredit Module - Active & Configurable */}
                <Card className="rounded-lg border-blue-100 bg-blue-50/10 md:col-span-2 lg:col-span-2 shadow-sm">
                    <CardHeader className="border-b border-blue-50/50 pb-4">
                        <CardTitle className="text-lg flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <img src="https://www.easycredit-ratenkauf.de/wp-content/uploads/2019/06/easycredit_ratenkauf_logo.png" className="h-5 w-auto" alt="easyCredit" />
                                <span>easyCredit Ratenkauf</span>
                            </div>
                            <Badge className="bg-green-500">Aktiv</Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-gray-500">Webshop-ID</Label>
                                <Input
                                    value={settingsForm.easyCreditWebshopId || ''}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setSettingsForm(prev => ({ ...prev, easyCreditWebshopId: val }));
                                    }}
                                    placeholder="z.B. 1.DE.11728.1"
                                    className="rounded-md border-gray-200"
                                />
                                <p className="text-[10px] text-gray-400">Erhältlich im easyCredit-Händlerportal.</p>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-gray-500">API-Token (Access Token)</Label>
                                <Input
                                    value={settingsForm.easyCreditToken || ''}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setSettingsForm(prev => ({ ...prev, easyCreditToken: val }));
                                    }}
                                    placeholder="Ihr easyCredit API-Token"
                                    className="rounded-md font-mono border-gray-200"
                                />
                                <p className="text-[10px] text-gray-400">Wird für Webcomponents v3 benötigt.</p>
                            </div>
                        </div>

                        <div className="p-4 bg-white/50 rounded-lg border border-blue-100/50 shadow-inner">
                            <div className="flex items-start gap-3">
                                <div className="bg-blue-100 p-2 rounded-lg mt-0.5">
                                    <Zap className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                    <h5 className="text-sm font-bold text-blue-900 mb-1">Echtzeit-Integration Aktiv</h5>
                                    <p className="text-[12px] text-blue-700 leading-relaxed font-medium">
                                        Der Ratenrechner erscheint bei Beträgen zwischen 200€ - 10.000€. Die Übermittlung erfolgt verschlüsselt direkt an easyCredit.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Other Static Modules */}
                {[
                    { name: 'DHL Versand', status: 'Aktiv', icon: Truck, color: 'bg-yellow-100 text-yellow-700' },
                    { name: 'Google Analytics', status: 'Aktiv', icon: BarChart2, color: 'bg-orange-100 text-orange-700' },
                    { name: 'SEO Optimizer', status: 'Aktiv', icon: Search, color: 'bg-green-100 text-green-700' },
                    { name: 'Mailchimp', status: 'Inaktiv', icon: Bell, color: 'bg-gray-100 text-gray-500' },
                    { name: 'Stripe Pay', status: 'Inaktiv', icon: CreditCard, color: 'bg-gray-100 text-gray-500' },
                ].map((module) => (
                    <Card key={module.name} className="hover:shadow-md transition-shadow cursor-default border-dashed opacity-75">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-2.5 rounded-lg ${module.color}`}>
                                    <module.icon className="w-5 h-5" />
                                </div>
                                <Badge variant={module.status === 'Aktiv' ? 'default' : 'secondary'} className="text-[10px]">
                                    {module.status}
                                </Badge>
                            </div>
                            <h4 className="font-bold text-base mb-1">{module.name}</h4>
                            <p className="text-[11px] text-gray-500">Integration für {module.name} ist vorkonfiguriert.</p>
                        </CardContent>
                    </Card>
                ))}

                {/* PayPal Checkout Module */}
                <Card className="rounded-lg border-blue-100 bg-white shadow-sm md:col-span-1 lg:col-span-1">
                    <CardHeader className="border-b border-gray-50 pb-4">
                        <CardTitle className="text-lg flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-blue-600" />
                                <span>PayPal Checkout</span>
                            </div>
                            <Badge className="bg-blue-500">Aktiv</Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase text-gray-500">PayPal Client-ID</Label>
                            <Input
                                value={settingsForm.paypalClientId || ''}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setSettingsForm(prev => ({ ...prev, paypalClientId: val }));
                                }}
                                placeholder="Z.B. AQz... (Live veya Sandbox)"
                                className="rounded-md border-gray-200 font-mono text-[11px]"
                            />
                            <p className="text-[10px] text-gray-400">Geben Sie Ihre Client-ID aus dem PayPal Developer Portal ein.</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Rechnungseinstellungen Module */}
                <Card className="rounded-lg border-red-100 bg-white shadow-sm md:col-span-1 lg:col-span-1">
                    <CardHeader className="border-b border-gray-50 pb-4">
                        <CardTitle className="text-lg flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Scroll className="w-5 h-5 text-red-600" />
                                <span>Rechnungseinstellungen</span>
                            </div>
                            <Badge className="bg-red-500">Aktiv</Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase text-gray-500">Start-Rechnungsnummer</Label>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-gray-400">RE-</span>
                                <Input
                                    type="number"
                                    value={settingsForm.invoiceStartNumber || ''}
                                    onChange={(e) => setSettingsForm({ ...settingsForm, invoiceStartNumber: e.target.value })}
                                    placeholder="1000"
                                    className="rounded-md border-gray-200 font-mono text-sm h-9"
                                />
                            </div>
                            <p className="text-[10px] text-gray-400">Die Nummer, ab der neue Rechnungen gezählt werden.</p>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase text-gray-500">Standard-Anmerkungen (Rechnung)</Label>
                            <textarea
                                className="w-full h-24 p-3 text-xs bg-gray-50 border border-gray-200 rounded-md focus:ring-1 focus:ring-red-500 outline-none transition-all placeholder:text-gray-300"
                                placeholder="Diese Notiz erscheint standardmäßig auf jeder Rechnung..."
                                value={settingsForm.defaultInvoiceNotes || ''}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setSettingsForm(prev => ({ ...prev, defaultInvoiceNotes: val }));
                                }}
                            />
                            <p className="text-[10px] text-gray-400">Wird als Standardtext für das Feld 'Anmerkungen' verwendet.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Bottom Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                <Button variant="outline" className="rounded-md px-6 shadow-sm">Abbrechen</Button>
                <Button
                    className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-md px-8 shadow-md"
                    onClick={handleSaveSettings}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Speichere...
                        </>
                    ) : 'Einstellungen speichern'}
                </Button>
            </div>
        </div>
    );

    const renderShippingSettings = () => (
        <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <Card className="rounded-lg shadow-sm">
                <CardHeader className="border-b border-gray-100 flex flex-row items-center justify-between pb-4">
                    <div className="flex items-center gap-2">
                        <div className="bg-blue-50 p-2 rounded-lg">
                            <Truck className="w-5 h-5 text-blue-600" />
                        </div>
                        <CardTitle className="text-lg">Versand-Einstellungen</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="space-y-10">
                        {['Klein Paket', 'Gross Paket', 'Spedition'].map((groupName) => (
                            <div key={groupName} className="space-y-4">
                                <div className="flex items-center justify-between border-b pb-2">
                                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${groupName === 'Klein Paket' ? 'bg-green-500' : groupName === 'Gross Paket' ? 'bg-blue-500' : 'bg-purple-500'}`} />
                                        {groupName}
                                    </h3>
                                    <Button
                                        size="xs"
                                        variant="outline"
                                        onClick={() => {
                                            const current = settingsForm?.shippingMethods || [];
                                            setSettingsForm({
                                                ...settingsForm,
                                                shippingMethods: [...current, { id: Date.now().toString(), name: '', price: '', group: groupName }]
                                            });
                                        }}
                                        className="h-7 text-[10px] items-center gap-1"
                                    >
                                        <Plus className="w-3 h-3" /> {groupName} için yeni şirket ekle
                                    </Button>
                                </div>

                                <div className="grid grid-cols-1 gap-3">
                                    {(settingsForm?.shippingMethods || [])
                                        .filter(m => (m.group || 'Klein Paket') === groupName)
                                        .map((method) => {
                                            const methodIndex = settingsForm.shippingMethods.findIndex(sm => sm.id === method.id);
                                            return (
                                                <div key={method.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-white rounded-lg border border-gray-100 items-end shadow-sm">
                                                    <div className="md:col-span-2 space-y-2">
                                                        <Label className="text-[10px] font-bold text-gray-400 uppercase">Versanddienstleister (z.B. DHL, Hermes)</Label>
                                                        <Input
                                                            value={method.name}
                                                            onChange={(e) => {
                                                                const newMethods = [...settingsForm.shippingMethods];
                                                                newMethods[methodIndex].name = e.target.value;
                                                                setSettingsForm({ ...settingsForm, shippingMethods: newMethods });
                                                            }}
                                                            placeholder="Şirket adı..."
                                                            className="h-9 text-sm"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] font-bold text-gray-400 uppercase">Preis (€)</Label>
                                                        <Input
                                                            type="text"
                                                            value={method.price === 0 && method.price !== '' ? '' : method.price}
                                                            onChange={(e) => {
                                                                const val = e.target.value.replace(',', '.');
                                                                if (val !== '' && !/^\d*\.?\d*$/.test(val)) return;
                                                                const newMethods = [...settingsForm.shippingMethods];
                                                                newMethods[methodIndex].price = val;
                                                                setSettingsForm({ ...settingsForm, shippingMethods: newMethods });
                                                            }}
                                                            placeholder="0.00"
                                                            className="h-9 text-sm"
                                                        />
                                                    </div>
                                                    <div className="flex justify-end">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-9 w-9 text-gray-400 hover:text-red-600 hover:bg-red-50"
                                                            onClick={() => {
                                                                const newMethods = settingsForm.shippingMethods.filter((_, i) => i !== methodIndex);
                                                                setSettingsForm({ ...settingsForm, shippingMethods: newMethods });
                                                            }}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            );
                                        })}

                                    {(settingsForm?.shippingMethods || []).filter(m => (m.group || 'Klein Paket') === groupName).length === 0 && (
                                        <div className="text-center py-6 text-gray-400 border border-dashed rounded-lg bg-gray-50/30 text-xs">
                                            Keine Versandarten für {groupName} konfiguriert.
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-10 pt-6 border-t flex justify-end">
                        <Button onClick={handleSaveSettings} disabled={isSubmitting} className="bg-red-600 hover:bg-red-700 text-white font-bold px-10 shadow-lg shadow-red-600/20">
                            {isSubmitting ? 'Speichert...' : 'Versand-Einstellungen speichern'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="rounded-lg shadow-sm mt-8">
                <CardHeader className="border-b border-gray-100 flex flex-row items-center justify-between pb-4">
                    <div className="flex items-center gap-2">
                        <div className="bg-green-50 p-2 rounded-lg">
                            <Globe className="w-5 h-5 text-green-600" />
                        </div>
                        <CardTitle className="text-lg">Länder-Versandkosten</CardTitle>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                                const europeCountries = [
                                    { code: 'AL', name: 'Albanien' }, { code: 'AD', name: 'Andorra' }, { code: 'BE', name: 'Belgien' },
                                    { code: 'BA', name: 'Bosnien und Herzegowina' }, { code: 'BG', name: 'Bulgarien' }, { code: 'DK', name: 'Dänemark' },
                                    { code: 'EE', name: 'Estland' }, { code: 'FI', name: 'Finnland' }, { code: 'FR', name: 'Frankreich' },
                                    { code: 'GR', name: 'Griechenland' }, { code: 'IE', name: 'Irland' }, { code: 'IS', name: 'Island' },
                                    { code: 'IT', name: 'Italien' }, { code: 'HR', name: 'Kroatien' }, { code: 'LV', name: 'Lettland' },
                                    { code: 'LI', name: 'Liechtenstein' }, { code: 'LT', name: 'Litauen' }, { code: 'LU', name: 'Luxemburg' },
                                    { code: 'MT', name: 'Malta' }, { code: 'MD', name: 'Moldawien' }, { code: 'MC', name: 'Monaco' },
                                    { code: 'ME', name: 'Montenegro' }, { code: 'NL', name: 'Niederlande' }, { code: 'MK', name: 'Nordmazedonien' },
                                    { code: 'NO', name: 'Norwegen' }, { code: 'PL', name: 'Polen' }, { code: 'PT', name: 'Portugal' },
                                    { code: 'RO', name: 'Rumänien' }, { code: 'SM', name: 'San Marino' }, { code: 'SE', name: 'Schweden' },
                                    { code: 'RS', name: 'Serbien' }, { code: 'SK', name: 'Slowakei' }, { code: 'SI', name: 'Slowenien' },
                                    { code: 'ES', name: 'Spanien' }, { code: 'CZ', name: 'Tschechien' }, { code: 'TR', name: 'Türkei' },
                                    { code: 'UA', name: 'Ukraine' }, { code: 'HU', name: 'Ungarn' }, { code: 'VA', name: 'Vatikanstadt' },
                                    { code: 'GB', name: 'Vereinigtes Königreich' }, { code: 'CY', name: 'Zypern' }
                                ];

                                const existingCodes = new Set(shippingRatesForm.map(r => r.country_code));
                                const newRates = [...shippingRatesForm];

                                europeCountries.forEach(c => {
                                    if (!existingCodes.has(c.code)) {
                                        newRates.push({
                                            id: `temp_${c.code}_${Date.now()}`,
                                            country_code: c.code,
                                            country_name: c.name,
                                            price: 0,
                                            free_shipping_threshold: '',
                                            delivery_time: '3-5 Werktage',
                                            is_active: true
                                        });
                                    }
                                });

                                setShippingRatesForm(newRates);
                                toast.success('Europa-Länder zur Liste hinzugefügt. Zum Speichern bitte unten auf Speichern klicken.');
                            }}
                        >
                            <Globe className="w-4 h-4 mr-2" /> Europa-Länder (Auto)
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                                setShippingRatesForm([
                                    ...shippingRatesForm,
                                    { id: `temp_${Date.now()}`, country_code: '', country_name: 'Neues Land', price: 0, free_shipping_threshold: '', delivery_time: '1-3 Werktage', is_active: true }
                                ]);
                            }}
                        >
                            <Plus className="w-4 h-4 mr-2" /> Land hinzufügen
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="space-y-4">
                        {shippingRatesForm.map((rate, index) => (
                            <div key={rate.id || index} className="grid grid-cols-1 lg:grid-cols-6 gap-4 p-4 bg-white rounded-lg border border-gray-100 items-end shadow-sm">
                                <div className="lg:col-span-2 space-y-2">
                                    <Label className="text-[10px] font-bold text-gray-400 uppercase">Land & Code</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={rate.country_code}
                                            onChange={(e) => {
                                                const newRates = [...shippingRatesForm];
                                                newRates[index].country_code = e.target.value.toUpperCase();
                                                setShippingRatesForm(newRates);
                                            }}
                                            placeholder="z.B. CH"
                                            className="w-16 h-9 text-sm text-center font-bold"
                                            maxLength={3}
                                        />
                                        <Input
                                            value={rate.country_name}
                                            onChange={(e) => {
                                                const newRates = [...shippingRatesForm];
                                                newRates[index].country_name = e.target.value;
                                                setShippingRatesForm(newRates);
                                            }}
                                            placeholder="Land..."
                                            className="h-9 text-sm flex-1"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold text-gray-400 uppercase">Versandpreis (€)</Label>
                                    <Input
                                        value={rate.price}
                                        onChange={(e) => {
                                            const newRates = [...shippingRatesForm];
                                            newRates[index].price = e.target.value.replace(',', '.');
                                            setShippingRatesForm(newRates);
                                        }}
                                        placeholder="0.00"
                                        className="h-9 text-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold text-gray-400 uppercase">Frei Ab (€)</Label>
                                    <Input
                                        value={rate.free_shipping_threshold || ''}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(',', '.');
                                            const newRates = [...shippingRatesForm];
                                            newRates[index].free_shipping_threshold = val;
                                            setShippingRatesForm(newRates);
                                        }}
                                        placeholder="Optional"
                                        className="h-9 text-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold text-gray-400 uppercase">Lieferzeit</Label>
                                    <Input
                                        value={rate.delivery_time || ''}
                                        onChange={(e) => {
                                            const newRates = [...shippingRatesForm];
                                            newRates[index].delivery_time = e.target.value;
                                            setShippingRatesForm(newRates);
                                        }}
                                        placeholder="z.B. 1-3 Werktage"
                                        className="h-9 text-sm"
                                    />
                                </div>

                                <div className="flex justify-end lg:justify-center items-center pb-1 gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-9 w-9 text-gray-400 hover:text-red-600 hover:bg-red-50"
                                        onClick={() => deleteShippingRate(rate.id, index)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                    <div
                                        onClick={() => {
                                            const newRates = [...shippingRatesForm];
                                            newRates[index].is_active = !rate.is_active;
                                            setShippingRatesForm(newRates);
                                        }}
                                        className={`w-10 h-5 flex items-center rounded-full p-1 cursor-pointer transition-colors ${rate.is_active ? 'bg-green-500' : 'bg-gray-300'}`}
                                    >
                                        <div className={`bg-white w-3 h-3 rounded-full shadow-md transform transition-transform ${rate.is_active ? 'translate-x-5' : ''}`}></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {shippingRatesForm.length === 0 && (
                            <div className="text-center py-6 text-gray-400 border border-dashed rounded-lg bg-gray-50/30 text-xs">
                                Keine Länder konfiguriert
                            </div>
                        )}
                    </div>
                </CardContent>
                <div className="p-6 border-t flex justify-end">
                    <Button onClick={handleSaveShippingRates} disabled={isSavingRates} className="bg-green-600 hover:bg-green-700 text-white font-bold px-10 shadow-lg shadow-green-600/20">
                        {isSavingRates ? 'Speichert...' : 'Länder-Preise speichern'}
                    </Button>
                </div>
            </Card>
        </div>
    );

    const renderHomeSettings = () => (
        <div className="max-w-6xl space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="grid grid-cols-1 gap-8">
                <Card className="rounded-lg">
                    <CardHeader className="border-b border-gray-100 pb-4">
                        <div className="flex items-center gap-2">
                            <div className="bg-red-50 p-2 rounded-lg">
                                <ImageIcon className="w-5 h-5 text-red-600" />
                            </div>
                            <CardTitle className="text-lg">Startseiten-Management</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-8 pt-6">
                        {/* Slider Settings */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                    <Layers className="w-4 h-4 text-gray-400" />
                                    Slider-Konfiguration (Große Bilder)
                                </h3>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 py-0 rounded-md bg-white hover:bg-gray-50 shadow-sm"
                                    onClick={() => {
                                        const currentForm = settingsForm || shopSettings || {};
                                        const currentSlides = [...(currentForm.sliderImages || [])];
                                        const newSlide = {
                                            id: Date.now(),
                                            image: '',
                                            title: 'Neuer Titel',
                                            subtitle: 'Neuer Untertitel',
                                            description: 'Kurze Beschreibung hier...',
                                            buttonText: 'Jetzt ansehen',
                                            buttonLink: ''
                                        };
                                        setSettingsForm({
                                            ...currentForm,
                                            sliderImages: [...currentSlides, newSlide]
                                        });
                                    }}
                                >
                                    <Plus className="w-4 h-4 mr-1" /> Neuen Slide hinzufügen
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                {(settingsForm?.sliderImages || []).map((slide, index) => (
                                    <div key={slide.id || index} className="p-4 border rounded-lg bg-gray-50/50 space-y-4 shadow-sm border-gray-100">
                                        <div className="flex justify-between items-center px-1">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">SLIDE #{index + 1}</span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-gray-400 hover:text-red-600 h-8"
                                                onClick={() => {
                                                    const newSlides = settingsForm.sliderImages.filter((_, i) => i !== index);
                                                    setSettingsForm({ ...settingsForm, sliderImages: newSlides });
                                                }}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-xs font-semibold text-gray-600">Bild-URL oder hochladen</Label>
                                                <div className="flex gap-2 items-center">
                                                    <Input
                                                        value={slide.image}
                                                        onChange={(e) => {
                                                            const newSlides = [...settingsForm.sliderImages];
                                                            newSlides[index].image = e.target.value;
                                                            setSettingsForm({ ...settingsForm, sliderImages: newSlides });
                                                        }}
                                                        placeholder="https://images.unsplash.com/..."
                                                        className="h-9 text-sm rounded-md border-gray-200 flex-1"
                                                    />
                                                    <label className="cursor-pointer shrink-0">
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            className="hidden"
                                                            onChange={(e) => handleSliderImageUpload(e, index)}
                                                        />
                                                        <div className="h-9 px-3 flex items-center gap-1.5 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-md transition-colors cursor-pointer whitespace-nowrap">
                                                            {isUploading ? (
                                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                            ) : (
                                                                <>
                                                                    <ImageIcon className="w-3.5 h-3.5" />
                                                                    Hochladen
                                                                </>
                                                            )}
                                                        </div>
                                                    </label>
                                                </div>
                                                {slide.image && (
                                                    <img src={slide.image} alt="Vorschau" className="h-16 w-full object-cover rounded-md border border-gray-100 mt-1" />
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-semibold text-gray-600">Untertitel (Badge-Text)</Label>
                                                <Input
                                                    value={slide.subtitle}
                                                    onChange={(e) => {
                                                        const newSlides = [...settingsForm.sliderImages];
                                                        newSlides[index].subtitle = e.target.value;
                                                        setSettingsForm({ ...settingsForm, sliderImages: newSlides });
                                                    }}
                                                    placeholder="z.B. New Arrival"
                                                    className="h-9 text-sm rounded-md border-gray-200"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-semibold text-gray-600">Haupttitel</Label>
                                                <Input
                                                    value={slide.title}
                                                    onChange={(e) => {
                                                        const newSlides = [...settingsForm.sliderImages];
                                                        newSlides[index].title = e.target.value;
                                                        setSettingsForm({ ...settingsForm, sliderImages: newSlides });
                                                    }}
                                                    placeholder="Hauptüberschrift des Slides"
                                                    className="h-9 text-sm rounded-md border-gray-200"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-semibold text-gray-600">Button-Beschriftung</Label>
                                                <Input
                                                    value={slide.buttonText}
                                                    onChange={(e) => {
                                                        const newSlides = [...settingsForm.sliderImages];
                                                        newSlides[index].buttonText = e.target.value;
                                                        setSettingsForm({ ...settingsForm, sliderImages: newSlides });
                                                    }}
                                                    placeholder="Jetzt kaufen / Mehr erfahren"
                                                    className="h-9 text-sm rounded-md border-gray-200"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-semibold text-gray-600">Button-Link (URL)</Label>
                                                <Input
                                                    value={slide.buttonLink || ''}
                                                    onChange={(e) => {
                                                        const newSlides = [...settingsForm.sliderImages];
                                                        newSlides[index].buttonLink = e.target.value;
                                                        setSettingsForm({ ...settingsForm, sliderImages: newSlides });
                                                    }}
                                                    placeholder="z.B. /product/123  |  /kategorie/e-bikes  |  https://..."
                                                    className="h-9 text-sm rounded-md border-gray-200"
                                                />
                                            </div>
                                            <div className="space-y-2 md:col-span-2">
                                                <Label className="text-xs font-semibold text-gray-600">Beschreibung</Label>
                                                <Input
                                                    value={slide.description}
                                                    onChange={(e) => {
                                                        const newSlides = [...settingsForm.sliderImages];
                                                        newSlides[index].description = e.target.value;
                                                        setSettingsForm({ ...settingsForm, sliderImages: newSlides });
                                                    }}
                                                    placeholder="Kurzer Werbetext für diesen Slide..."
                                                    className="h-9 text-sm rounded-md border-gray-200"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Side Banners (Right Sidebar) */}
                        <div className="space-y-6 pt-4 border-t border-gray-50">
                            <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                    <Monitor className="w-4 h-4 text-gray-400" />
                                    Neben-Banner (Rechte Sidebar - 2 kleine Bilder)
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {(settingsForm?.sideBanners || []).map((banner, index) => (
                                    <div key={banner.id || index} className="p-4 border rounded-lg bg-gray-50/50 space-y-4 shadow-sm border-gray-100">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">BANNER #{index + 1}</span>
                                        </div>
                                        <div className="grid grid-cols-1 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-xs font-semibold text-gray-600">Bild-URL</Label>
                                                <Input
                                                    value={banner.image}
                                                    onChange={(e) => {
                                                        const newBanners = [...settingsForm.sideBanners];
                                                        newBanners[index].image = e.target.value;
                                                        setSettingsForm({ ...settingsForm, sideBanners: newBanners });
                                                    }}
                                                    placeholder="Bild URL..."
                                                    className="h-9 text-sm rounded-md border-gray-200"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-semibold text-gray-600">Titel</Label>
                                                    <Input
                                                        value={banner.title}
                                                        onChange={(e) => {
                                                            const newBanners = [...settingsForm.sideBanners];
                                                            newBanners[index].title = e.target.value;
                                                            setSettingsForm({ ...settingsForm, sideBanners: newBanners });
                                                        }}
                                                        className="h-9 text-sm rounded-md border-gray-200"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-semibold text-gray-600">Untertitel</Label>
                                                    <Input
                                                        value={banner.subtitle}
                                                        onChange={(e) => {
                                                            const newBanners = [...settingsForm.sideBanners];
                                                            newBanners[index].subtitle = e.target.value;
                                                            setSettingsForm({ ...settingsForm, sideBanners: newBanners });
                                                        }}
                                                        className="h-9 text-sm rounded-md border-gray-200"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-semibold text-gray-600">Akzentfarbe (Subtitle)</Label>
                                                <div className="flex gap-2 items-center">
                                                    <Input
                                                        type="color"
                                                        value={banner.color || '#ef4444'}
                                                        onChange={(e) => {
                                                            const newBanners = [...settingsForm.sideBanners];
                                                            newBanners[index].color = e.target.value;
                                                            setSettingsForm({ ...settingsForm, sideBanners: newBanners });
                                                        }}
                                                        className="w-12 h-9 p-1 rounded-md border-gray-200"
                                                    />
                                                    <Input
                                                        value={banner.color || '#ef4444'}
                                                        onChange={(e) => {
                                                            const newBanners = [...settingsForm.sideBanners];
                                                            newBanners[index].color = e.target.value;
                                                            setSettingsForm({ ...settingsForm, sideBanners: newBanners });
                                                        }}
                                                        className="h-9 text-xs font-mono rounded-md border-gray-200"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-semibold text-gray-600">Banner-Link (URL)</Label>
                                                <Input
                                                    value={banner.link || ''}
                                                    onChange={(e) => {
                                                        const newBanners = [...settingsForm.sideBanners];
                                                        newBanners[index].link = e.target.value;
                                                        setSettingsForm({ ...settingsForm, sideBanners: newBanners });
                                                    }}
                                                    placeholder="z.B. /product/123  |  /kategorie/e-bikes  |  https://..."
                                                    className="h-9 text-sm rounded-md border-gray-200"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Services Settings */}
                        <div className="space-y-6 pt-4 border-t border-gray-50">
                            <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                    <Monitor className="w-4 h-4 text-gray-400" />
                                    Service-Bereich (Features / Icons)
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {(settingsForm?.services || []).map((service, index) => (
                                    <div key={service.id || index} className="p-4 border rounded-lg bg-gray-50/50 space-y-4 shadow-sm border-gray-100">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">SERVICE #{index + 1}</span>
                                        </div>
                                        <div className="grid grid-cols-1 gap-3">
                                            <div className="space-y-1">
                                                <Label className="text-[11px] font-bold text-gray-500">Icon auswählen</Label>
                                                <Select
                                                    value={service.icon}
                                                    onValueChange={(val) => {
                                                        const newServices = [...settingsForm.services];
                                                        newServices[index].icon = val;
                                                        setSettingsForm({ ...settingsForm, services: newServices });
                                                    }}
                                                >
                                                    <SelectTrigger className="h-8 text-xs rounded-md border-gray-200">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Headphones">Support (Kopfhörer)</SelectItem>
                                                        <SelectItem value="Shield">Sicherheit (Schild)</SelectItem>
                                                        <SelectItem value="Gift">Angebote (Geschenk)</SelectItem>
                                                        <SelectItem value="Truck">Versand (LKW)</SelectItem>
                                                        <SelectItem value="Star">Premium (Stern)</SelectItem>
                                                        <SelectItem value="Zap">Schnell (Blitz)</SelectItem>
                                                        <SelectItem value="Heart">Favorit (Herz)</SelectItem>
                                                        <SelectItem value="RefreshCw">Rückgabe (Pfeile)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-[11px] font-bold text-gray-500">Titel</Label>
                                                <Input
                                                    value={service.title}
                                                    onChange={(e) => {
                                                        const newServices = [...settingsForm.services];
                                                        newServices[index].title = e.target.value;
                                                        setSettingsForm({ ...settingsForm, services: newServices });
                                                    }}
                                                    className="h-8 text-xs rounded-md border-gray-200"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-[11px] font-bold text-gray-500">Beschreibung</Label>
                                                <Input
                                                    value={service.description}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        setSettingsForm(prev => ({
                                                            ...prev,
                                                            services: (prev.services || []).map((s, i) =>
                                                                i === index ? { ...s, description: val } : s
                                                            )
                                                        }));
                                                    }}
                                                    className="h-8 text-xs rounded-md border-gray-200"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Blog Posts (Neuigkeiten) Settings */}
                        <div className="space-y-6 pt-4 border-t border-gray-50">
                            <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                    <Layers className="w-4 h-4 text-gray-400" />
                                    Neuigkeiten (Blog-Beiträge)
                                </h3>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 py-0 rounded-md bg-white hover:bg-gray-50 shadow-sm"
                                    onClick={() => {
                                        const newPost = {
                                            id: Date.now(),
                                            title: 'Neuer Beitrag',
                                            date: new Date().toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' }),
                                            author: 'Electrive Team',
                                            excerpt: 'Kurze Beschreibung des Beitrags...',
                                            image: ''
                                        };
                                        setSettingsForm(prev => ({ ...prev, blogPosts: [...(prev.blogPosts || []), newPost] }));
                                    }}
                                >
                                    <Plus className="w-4 h-4 mr-1" /> Beitrag hinzufügen
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {(settingsForm?.blogPosts || []).map((post, index) => (
                                    <div key={post.id || index} className="p-4 border rounded-lg bg-gray-50/50 space-y-4 shadow-sm border-gray-100">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">BEITRAG #{index + 1}</span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-gray-400 hover:text-red-600 h-7 w-7 p-0"
                                                onClick={() => {
                                                    setSettingsForm(prev => ({
                                                        ...prev,
                                                        blogPosts: (prev.blogPosts || []).filter((_, i) => i !== index)
                                                    }));
                                                }}
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-semibold text-gray-600">Titel</Label>
                                                <Input
                                                    value={post.title}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        setSettingsForm(prev => ({
                                                            ...prev,
                                                            blogPosts: (prev.blogPosts || []).map((p, i) =>
                                                                i === index ? { ...p, title: val } : p
                                                            )
                                                        }));
                                                    }}
                                                    className="h-8 text-sm rounded-md border-gray-200"
                                                    placeholder="Beitragtitel..."
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-1.5">
                                                    <Label className="text-xs font-semibold text-gray-600">Datum</Label>
                                                    <Input
                                                        value={post.date}
                                                        onChange={(e) => {
                                                            const newPosts = [...settingsForm.blogPosts];
                                                            newPosts[index].date = e.target.value;
                                                            setSettingsForm({ ...settingsForm, blogPosts: newPosts });
                                                        }}
                                                        className="h-8 text-xs rounded-md border-gray-200"
                                                        placeholder="z.B. 11. Dez 2024"
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label className="text-xs font-semibold text-gray-600">Autor</Label>
                                                    <Input
                                                        value={post.author}
                                                        onChange={(e) => {
                                                            const newPosts = [...settingsForm.blogPosts];
                                                            newPosts[index].author = e.target.value;
                                                            setSettingsForm({ ...settingsForm, blogPosts: newPosts });
                                                        }}
                                                        className="h-8 text-xs rounded-md border-gray-200"
                                                        placeholder="Autorenname..."
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-semibold text-gray-600">Bild-URL</Label>
                                                <Input
                                                    value={post.image}
                                                    onChange={(e) => {
                                                        const newPosts = [...settingsForm.blogPosts];
                                                        newPosts[index].image = e.target.value;
                                                        setSettingsForm({ ...settingsForm, blogPosts: newPosts });
                                                    }}
                                                    className="h-8 text-xs rounded-md border-gray-200"
                                                    placeholder="https://images.unsplash.com/..."
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-semibold text-gray-600">Kurzbeschreibung</Label>
                                                <textarea
                                                    value={post.excerpt}
                                                    onChange={(e) => {
                                                        const newPosts = [...settingsForm.blogPosts];
                                                        newPosts[index].excerpt = e.target.value;
                                                        setSettingsForm({ ...settingsForm, blogPosts: newPosts });
                                                    }}
                                                    rows={3}
                                                    className="w-full text-xs rounded-md border border-gray-200 bg-white px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                                                    placeholder="Kurzer Beschreibungstext..."
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <Button variant="outline" className="rounded-md px-6 shadow-sm">Abbrechen</Button>
                <Button
                    className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-md px-8 shadow-md"
                    onClick={handleSaveSettings}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Speichere...
                        </>
                    ) : 'Einstellungen speichern'}
                </Button>
            </div>
        </div>
    );

    const renderSettings = () => (
        <div className="max-w-6xl space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="rounded-lg">
                    <CardHeader>
                        <CardTitle className="text-lg">Shop-Informationen</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Shop Name</Label>
                            <Input
                                value={settingsForm.shopName}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setSettingsForm(prev => ({ ...prev, shopName: val }));
                                }}
                                className="rounded-md"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Shop Slogan (Tagline)</Label>
                            <Input
                                value={settingsForm.shopTagline || ''}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setSettingsForm(prev => ({ ...prev, shopTagline: val }));
                                }}
                                placeholder="örn: Technologie"
                                className="rounded-md"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Support E-Mail</Label>
                            <Input
                                value={settingsForm.supportEmail}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setSettingsForm(prev => ({ ...prev, supportEmail: val }));
                                }}
                                className="rounded-md"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Support Telefonnummer</Label>
                            <Input
                                value={settingsForm.supportPhone || ''}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setSettingsForm(prev => ({ ...prev, supportPhone: val }));
                                }}
                                placeholder="+49 123 456789"
                                className="rounded-md"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Währung</Label>
                            <Select
                                value={settingsForm.currency}
                                onValueChange={(val) => setSettingsForm({ ...settingsForm, currency: val })}
                            >
                                <SelectTrigger className="rounded-md">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="eur">Euro (€)</SelectItem>
                                    <SelectItem value="usd">USD ($)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-lg">
                    <CardHeader>
                        <CardTitle className="text-lg">Geschäfts- & Steuerdaten</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Offizieller Firmenname</Label>
                            <Input
                                value={settingsForm.companyName || ''}
                                onChange={(e) => setSettingsForm({ ...settingsForm, companyName: e.target.value })}
                                placeholder="Electrive GmbH"
                                className="rounded-md"
                            />
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Straße & Hausnummer</Label>
                                <Input
                                    value={settingsForm.companyStreet || ''}
                                    onChange={(e) => setSettingsForm({ ...settingsForm, companyStreet: e.target.value })}
                                    placeholder="Musterstr. 1"
                                    className="rounded-md"
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>PLZ</Label>
                                    <Input
                                        value={settingsForm.companyZip || ''}
                                        onChange={(e) => setSettingsForm({ ...settingsForm, companyZip: e.target.value })}
                                        placeholder="12345"
                                        className="rounded-md"
                                    />
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <Label>Stadt</Label>
                                    <Input
                                        value={settingsForm.companyCity || ''}
                                        onChange={(e) => setSettingsForm({ ...settingsForm, companyCity: e.target.value })}
                                        placeholder="Stadt"
                                        className="rounded-md"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Steuernummer</Label>
                                <Input
                                    value={settingsForm.taxNumber || ''}
                                    onChange={(e) => setSettingsForm({ ...settingsForm, taxNumber: e.target.value })}
                                    className="rounded-md"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>USt-IdNr. (VAT ID)</Label>
                                <Input
                                    value={settingsForm.vatId || ''}
                                    onChange={(e) => setSettingsForm({ ...settingsForm, vatId: e.target.value })}
                                    className="rounded-md"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Inhaber / GF</Label>
                            <Input
                                value={settingsForm.owner || ''}
                                onChange={(e) => setSettingsForm({ ...settingsForm, owner: e.target.value })}
                                className="rounded-md"
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-lg">
                    <CardHeader>
                        <CardTitle className="text-lg">Bankverbindung</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Bankname</Label>
                            <Input
                                value={settingsForm.bankName || ''}
                                onChange={(e) => setSettingsForm({ ...settingsForm, bankName: e.target.value })}
                                className="rounded-md"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>IBAN</Label>
                            <Input
                                value={settingsForm.iban || ''}
                                onChange={(e) => setSettingsForm({ ...settingsForm, iban: e.target.value })}
                                className="rounded-md font-mono"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>BIC</Label>
                            <Input
                                value={settingsForm.bic || ''}
                                onChange={(e) => setSettingsForm({ ...settingsForm, bic: e.target.value })}
                                className="rounded-md font-mono"
                            />
                        </div>
                    </CardContent>
                </Card>



                <Card className="rounded-lg">
                    <CardHeader>
                        <CardTitle className="text-lg">Design & Branding</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-3">
                            <Label>Primärfarbe</Label>
                            <div className="flex flex-wrap gap-2 mb-3">
                                {[
                                    { name: 'Rot', value: '#dc2626' },
                                    { name: 'Blau', value: '#2563eb' },
                                    { name: 'Grün', value: '#16a34a' },
                                    { name: 'Lila', value: '#9333ea' },
                                    { name: 'Orange', value: '#ea580c' },
                                    { name: 'Schwarz', value: '#000000' },
                                ].map((color) => (
                                    <button
                                        key={color.value}
                                        onClick={() => setSettingsForm({ ...settingsForm, primaryColor: color.value })}
                                        className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${settingsForm.primaryColor === color.value ? 'border-gray-900 scale-110 shadow-md' : 'border-transparent'}`}
                                        style={{ backgroundColor: color.value }}
                                        title={color.name}
                                        type="button"
                                    />
                                ))}
                            </div>
                            <ColorPickerField
                                value={settingsForm.primaryColor}
                                onChange={(val) => setSettingsForm({ ...settingsForm, primaryColor: val })}
                            />
                        </div>
                        <div className="space-y-4">
                            <Label>Shop Logo</Label>
                            <div className="flex flex-col gap-4">
                                {settingsForm.logoUrl && (
                                    <div className="w-32 h-32 rounded-lg border flex items-center justify-center p-2 bg-white shadow-sm overflow-hidden">
                                        <img src={settingsForm.logoUrl} alt="Logo Preview" className="max-w-full max-h-full object-contain" />
                                    </div>
                                )}
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Logo URL (z.B. https://...)"
                                        value={settingsForm.logoUrl || ''}
                                        onChange={(e) => setSettingsForm({ ...settingsForm, logoUrl: e.target.value })}
                                        className="rounded-md flex-1"
                                    />
                                    <input
                                        type="file"
                                        id="logo-upload"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleLogoUpload}
                                    />
                                    <Button
                                        variant="outline"
                                        className="rounded-md"
                                        onClick={() => document.getElementById('logo-upload').click()}
                                        disabled={isSubmitting}
                                    >
                                        <Upload className="w-4 h-4" />
                                    </Button>
                                </div>
                                <p className="text-[10px] text-gray-400 font-medium italic">
                                    * Es wird empfohlen, das Logo mit weißem oder transparentem Hintergrund zu verwenden.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <Button variant="outline" className="rounded-md">Abbrechen</Button>
                <Button
                    className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-md px-8 shadow-md"
                    onClick={handleSaveSettings}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Speichere...
                        </>
                    ) : 'Einstellungen speichern'}
                </Button>
            </div>
        </div>
    );

    const renderFooterSettings = () => (
        <div className="max-w-6xl space-y-6 animate-in fade-in slide-in-from-bottom-4">
            {/* Sub-Tabs Navigation */}
            <div className="flex flex-wrap gap-2 p-1 bg-gray-100/50 rounded-xl border border-gray-200">
                {[
                    { id: 'social', label: 'Social Media', icon: Share2 },
                    { id: 'legal', label: 'Rechtliches & Dokumente', icon: Scale },
                    { id: 'info', label: 'Footer Info', icon: FileText },
                    { id: 'newsletter', label: 'Newsletter', icon: Mail }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setFooterTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 
                            ${footerTab === tab.id
                                ? 'bg-white text-red-600 shadow-sm ring-1 ring-gray-200/50'
                                : 'text-gray-500 hover:text-gray-800 hover:bg-white/50'}`}
                    >
                        <tab.icon className={`w-4 h-4 ${footerTab === tab.id ? 'text-red-500' : ''}`} />
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="mt-6">
                {footerTab === 'social' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-300">
                        <Card className="rounded-lg">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Share2 className="w-5 h-5 text-blue-600" />
                                    Social Media Links
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Facebook URL</Label>
                                    <Input
                                        value={settingsForm.facebookUrl || ''}
                                        onChange={(e) => setSettingsForm({ ...settingsForm, facebookUrl: e.target.value })}
                                        placeholder="https://facebook.com/ihre-seite"
                                        className="rounded-md"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Instagram URL</Label>
                                    <Input
                                        value={settingsForm.instagramUrl || ''}
                                        onChange={(e) => setSettingsForm({ ...settingsForm, instagramUrl: e.target.value })}
                                        placeholder="https://instagram.com/ihr-profil"
                                        className="rounded-md"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Twitter / X URL</Label>
                                    <Input
                                        value={settingsForm.twitterUrl || ''}
                                        onChange={(e) => setSettingsForm({ ...settingsForm, twitterUrl: e.target.value })}
                                        placeholder="https://twitter.com/ihr-account"
                                        className="rounded-md"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Youtube URL</Label>
                                    <Input
                                        value={settingsForm.youtubeUrl || ''}
                                        onChange={(e) => setSettingsForm({ ...settingsForm, youtubeUrl: e.target.value })}
                                        placeholder="https://youtube.com/@ihr-kanal"
                                        className="rounded-md"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="rounded-lg bg-blue-50/10 border-blue-50">
                            <CardHeader>
                                <CardTitle className="text-md font-bold text-blue-900">Anzeige Hinweis</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-blue-700 leading-relaxed italic">
                                    Diese Links erscheinen als Icons im unteren Bereich (Footer) Ihrer Website.
                                    Lassen Sie ein Feld leer, wenn Sie das entsprechende Icon ausblenden möchten.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {footerTab === 'legal' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-300">
                        <Card className="rounded-lg">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                                <CardTitle className="text-lg">Rechtliche Dokumente & Seiten</CardTitle>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={addLegalDoc}
                                    className="gap-2 border-green-200 text-green-600 hover:bg-green-50 font-bold"
                                >
                                    <Plus className="w-4 h-4" />
                                    Neues Dokument hinzufügen
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {(settingsForm.legalDocs || []).map((doc, index) => (
                                    <div key={doc.id} className="space-y-3 p-4 rounded-lg bg-gray-50/50 border border-gray-100 group relative">
                                        <div className="flex justify-between items-center mb-1">
                                            <Label className="text-xs font-bold uppercase text-gray-400">
                                                Abschnitt {index + 1}
                                            </Label>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeLegalDoc(doc.id)}
                                                className="h-7 w-7 text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                        <div className="flex gap-2">
                                            <Input
                                                value={doc.label}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setSettingsForm(prev => ({
                                                        ...prev,
                                                        legalDocs: (prev.legalDocs || []).map((d, i) =>
                                                            i === index ? { ...d, label: val } : d
                                                        )
                                                    }));
                                                }}
                                                placeholder="Titel (z.B. Impressum)"
                                                className="rounded-md"
                                            />
                                            <Button
                                                variant="outline"
                                                className={`gap-2 shrink-0 font-bold transition-all ${doc.content ? 'border-green-200 text-green-600 bg-green-50/30 hover:bg-green-100/50' : 'border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700'}`}
                                                onClick={() => openLegalEditor(doc.id, doc.label)}
                                            >
                                                <FileText className="w-4 h-4" />
                                                {doc.content ? 'Inhalt hinzugefügt ✓' : 'Inhalt bearbeiten'}
                                            </Button>
                                        </div>
                                    </div>
                                ))}

                                {(!settingsForm.legalDocs || settingsForm.legalDocs.length === 0) && (
                                    <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-xl">
                                        <HelpCircle className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                                        <p className="text-sm text-gray-400">Keine rechtlichen Dokumente definiert.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="rounded-lg bg-red-50/5 border-red-100/50 h-fit">
                            <CardHeader>
                                <CardTitle className="text-md font-bold text-red-900 flex items-center gap-2">
                                    <Scroll className="w-4 h-4" />
                                    Dynamische Dokumente
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-red-700/80 leading-relaxed">
                                    Sie können hier beliebig viele rechtliche Seiten hinzufügen. Jede Seite wird automatisch mit dem von Ihnen gewählten **Titel** im Footer verlinkt.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {footerTab === 'info' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-300">
                        <Card className="rounded-lg">
                            <CardHeader>
                                <CardTitle className="text-lg">Shop Footer Informationen</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Copyright Text</Label>
                                    <Input
                                        value={settingsForm.footerCopyright || `© ${new Date().getFullYear()} ${settingsForm.shopName}. Alle Rechte vorbehalten.`}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setSettingsForm(prev => ({ ...prev, footerCopyright: val }));
                                        }}
                                        placeholder="© 2024 Electrive..."
                                        className="rounded-md"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Footer Slogan / Kurzbeschreibung</Label>
                                    <textarea
                                        value={settingsForm.footerDescription || ''}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setSettingsForm(prev => ({ ...prev, footerDescription: val }));
                                        }}
                                        className="w-full text-sm rounded-md border border-gray-200 bg-white px-3 py-2 resize-none h-32 focus:outline-none focus:ring-1 focus:ring-red-500"
                                        placeholder="Ihr Spezialist für E-Bikes und Zubehör..."
                                    />
                                    <p className="text-[10px] text-gray-400 font-medium">Dieser Text erscheint unter dem Logo im Footer.</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="rounded-lg">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                                <CardTitle className="text-lg">Zahlungsmethoden Icons</CardTitle>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={addPaymentIcon}
                                    className="gap-2 border-green-200 text-green-600 hover:bg-green-50 font-bold"
                                >
                                    <Plus className="w-4 h-4" />
                                    Icon hinzufügen
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {(settingsForm.paymentIcons || []).map((icon, index) => (
                                    <div key={icon.id} className="p-4 rounded-lg bg-gray-50/50 border border-gray-100 relative group animate-in fade-in slide-in-from-top-1 duration-200">
                                        <div className="flex justify-between items-center mb-3">
                                            <Label className="text-[10px] font-black uppercase text-gray-400">Icon {index + 1}</Label>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removePaymentIcon(icon.id)}
                                                className="h-6 w-6 text-gray-300 hover:text-red-500 hover:bg-red-50"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-xs">Name (z.B. Visa)</Label>
                                                <Input
                                                    value={icon.name}
                                                    onChange={(e) => {
                                                        const newIcons = [...settingsForm.paymentIcons];
                                                        newIcons[index].name = e.target.value;
                                                        setSettingsForm({ ...settingsForm, paymentIcons: newIcons });
                                                    }}
                                                    placeholder="Visa, PayPal, etc."
                                                    className="h-8 text-xs font-bold uppercase tracking-wider"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs">Bild / Icon</Label>
                                                <div className="flex gap-2">
                                                    <div className="flex-1 relative">
                                                        <Input
                                                            value={icon.url}
                                                            onChange={(e) => {
                                                                const newIcons = [...settingsForm.paymentIcons];
                                                                newIcons[index].url = e.target.value;
                                                                setSettingsForm({ ...settingsForm, paymentIcons: newIcons });
                                                            }}
                                                            placeholder="URL oder Hochladen ->"
                                                            className="h-8 text-[11px] pr-8"
                                                        />
                                                        {icon.url && (
                                                            <div className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded overflow-hidden shadow-sm border border-gray-100 bg-white">
                                                                <img src={icon.url} alt="Preview" className="w-full h-full object-contain" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="relative">
                                                        <input
                                                            type="file"
                                                            id={`icon-upload-${icon.id}`}
                                                            className="hidden"
                                                            accept="image/*"
                                                            onChange={(e) => handlePaymentIconUpload(e, icon.id)}
                                                        />
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-8 px-2 border-red-200 text-red-600 hover:bg-red-50"
                                                            onClick={() => document.getElementById(`icon-upload-${icon.id}`).click()}
                                                            disabled={isSubmitting}
                                                        >
                                                            <Upload className="w-3 h-3" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {(!settingsForm.paymentIcons || settingsForm.paymentIcons.length === 0) && (
                                    <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/20">
                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Keine Icons definiert</p>
                                        <p className="text-[10px] text-gray-300 mt-1">Fügen Sie Icons für Zahlungsmethoden hinzu, die im Footer angezeigt werden sollen.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}

                {footerTab === 'newsletter' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-300">
                        <Card className="rounded-lg">
                            <CardHeader>
                                <CardTitle className="text-lg">Newsletter Marketing</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Newsletter Titel</Label>
                                    <Input
                                        value={settingsForm.newsletterTitle || 'Jetzt zum Newsletter anmelden!'}
                                        onChange={(e) => setSettingsForm({ ...settingsForm, newsletterTitle: e.target.value })}
                                        className="rounded-md"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Newsletter Beschreibung</Label>
                                    <textarea
                                        value={settingsForm.newsletterDescription || 'Erhalten Sie Informationen über exklusive Angebote und neue Produkte.'}
                                        onChange={(e) => setSettingsForm({ ...settingsForm, newsletterDescription: e.target.value })}
                                        className="w-full text-sm rounded-md border border-gray-200 bg-white px-3 py-2 resize-none h-24 focus:outline-none focus:ring-1 focus:ring-red-500"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                <Button variant="outline" className="rounded-md">Abbrechen</Button>
                <Button
                    className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-md px-8 shadow-md"
                    onClick={handleSaveSettings}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Speichere...
                        </>
                    ) : 'Einstellungen speichern'}
                </Button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex font-sans transition-colors duration-300">
            {/* Sidebar */}
            <aside
                className={`${isSidebarOpen ? 'w-64' : 'w-20'
                    } bg-white dark:bg-[#111] border-r border-gray-200 dark:border-white/10 transition-all duration-300 flex flex-col fixed h-full z-30 print:hidden`}
            >
                <div className="h-16 flex items-center justify-center border-b border-gray-100 dark:border-white/5">
                    {isSidebarOpen ? (
                        <h1 className="text-xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
                            {shopSettings?.shopName?.split(' ')[0]?.toUpperCase() || 'ELECTRIVE'}<span className="text-xs text-gray-400 dark:text-gray-500 font-normal ml-1">ADMIN</span>
                        </h1>
                    ) : (
                        <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold">
                            {shopSettings?.shopName?.charAt(0)?.toUpperCase() || 'E'}
                        </div>
                    )}
                </div>

                <nav className="flex-1 overflow-y-auto py-4">
                    <ul className="space-y-1 px-3">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <li key={item.id}>
                                    <button
                                        onClick={item.action ? item.action : () => handleTabChange(item.label)}
                                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors relative group 
                                            ${activeTab === item.label ? 'bg-red-50 dark:bg-red-900/10 text-red-600 font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white border border-transparent'} 
                                            ${item.id === 'back_to_site' ? 'mt-4 border-t border-gray-100 dark:border-white/5 pt-6 rounded-none hover:bg-transparent' : ''}
                                            ${item.isSubItem && isSidebarOpen ? 'pl-9 py-2 text-sm' : ''}`}
                                    >
                                        <Icon className={`${item.isSubItem ? 'w-4 h-4' : 'w-5 h-5'} transition-transform group-hover:scale-110 ${activeTab === item.label ? 'text-red-600' : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200'}`} />
                                        {isSidebarOpen && (
                                            <span className="flex-1 text-left">{item.label}</span>
                                        )}
                                        {activeTab === item.label && (
                                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-red-600 rounded-r-full shadow-[2px_0_8px_rgba(220,38,38,0.3)]"></div>
                                        )}
                                        {isSidebarOpen && item.id === 'back_to_site' && (
                                            <Eye className="w-4 h-4 text-gray-400 group-hover:text-red-600 transition-colors" />
                                        )}
                                        {isSidebarOpen && item.badge && (
                                            <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
                                                {item.badge}
                                            </span>
                                        )}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                <div className="p-4 border-t border-gray-100 dark:border-white/5">
                    <button
                        onClick={() => {
                            logout();
                            navigate('/');
                        }}
                        className={`flex items-center gap-3 text-gray-500 dark:text-gray-400 hover:text-red-600 transition-colors w-full px-3 py-2 ${!isSidebarOpen && 'justify-center'}`}
                    >
                        <LogOut className="w-5 h-5" />
                        {isSidebarOpen && <span>Abmelden</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'} print:ml-0 bg-gray-50 dark:bg-[#0a0a0a]`}>
                {/* Top Header */}
                <header className="h-16 bg-white dark:bg-[#111] border-b border-gray-200 dark:border-white/10 sticky top-0 z-20 px-8 flex items-center justify-between print:hidden">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg text-gray-500 dark:text-gray-400 font-bold"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        <div className="relative hidden md:block w-96 group">
                            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-600 transition-colors" />
                            <input
                                type="text"
                                placeholder="Global suchen..."
                                className="w-full pl-11 pr-4 py-2.5 bg-gray-50 dark:bg-white/5 border-none rounded-lg text-sm ring-1 ring-gray-100 dark:ring-white/10 focus:ring-2 focus:ring-red-600/20 focus:outline-none transition-all placeholder:text-gray-300 dark:text-white"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate('/')}
                            className="hidden md:flex items-center gap-2 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10 mr-4"
                        >
                            <Eye className="w-4 h-4" />
                            Zur Website
                        </Button>
                        <button className="relative text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white">
                            <Bell className="w-5 h-5" />
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-[#111]"></span>
                        </button>
                        <div className="flex items-center gap-3 pl-6 border-l border-gray-200 dark:border-white/10">
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">Admin User</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Administrator</p>
                            </div>
                            <div className="w-10 h-10 bg-gray-200 dark:bg-[#333] rounded-full overflow-hidden border-2 border-white dark:border-white/10 shadow-sm">
                                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" alt="Admin" />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dashboard Content */}
                <div className="p-8 print:p-0">
                    <div className="mb-8 flex items-center justify-between print:hidden">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{activeTab}</h2>
                            <p className="text-gray-500 dark:text-gray-400">Willkommen zurück im Admin Dashboard.</p>
                        </div>
                        <div className="flex gap-3">
                            <Button variant="outline" className="bg-white dark:bg-[#1a1a1a] dark:text-white dark:border-white/10" onClick={() => window.print()}>
                                <Printer className="w-4 h-4 mr-2" />
                                Bericht exportieren
                            </Button>
                            <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={() => handleTabChange('Bestellungen')}>
                                <Plus className="w-4 h-4 mr-2" />
                                Alle Bestellungen
                            </Button>
                        </div>
                    </div>

                    {renderContent()}
                </div>
            </main>

            {/* Customer Details Modal */}
            {/* Order Detail Modal */}
            <Dialog open={isOrderModalOpen} onOpenChange={setIsOrderModalOpen}>
                <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center justify-between pr-8">
                            <div className="flex items-center gap-3">
                                <div className="bg-red-50 p-2 rounded-lg">
                                    <ShoppingCart className="w-5 h-5 text-red-600" />
                                </div>
                                <span>Bestellung #{selectedOrder?.id.slice(0, 8).toUpperCase()}</span>
                            </div>
                            <Badge className={
                                selectedOrder?.status === 'completed' ? 'bg-green-100 text-green-700' :
                                    selectedOrder?.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                                        'bg-yellow-100 text-yellow-700'
                            }>
                                {selectedOrder?.status.toUpperCase()}
                            </Badge>
                        </DialogTitle>
                    </DialogHeader>

                    {selectedOrder && (
                        <div className="space-y-6 py-4">
                            {/* Customer Info */}
                            <div className="grid grid-cols-2 gap-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                                <div className="space-y-1">
                                    <Label className="text-[10px] uppercase font-bold text-gray-400">Kunde</Label>
                                    <p className="font-bold text-gray-900">{selectedOrder.customer_name}</p>
                                    <p className="text-sm text-gray-500">{selectedOrder.customer_email}</p>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[10px] uppercase font-bold text-gray-400">Bestelldatum</Label>
                                    <p className="text-sm font-medium">
                                        {new Date(selectedOrder.created_at).toLocaleString('de-DE')}
                                    </p>
                                    <p className="text-xs text-gray-400">Zahlungsart: {selectedOrder.payment_method}</p>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="space-y-3">
                                <Label className="text-sm font-bold">Bestellte Artikel</Label>
                                <div className="border rounded-lg divide-y overflow-hidden">
                                    {orderItems.map((item) => (
                                        <div key={item.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                                            <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                                <img src={item.products?.image} alt="" className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-gray-900 truncate">{item.products?.name}</p>
                                                <p className="text-xs text-gray-500 font-mono">SKU: {item.products?.sku || 'N/A'}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-gray-900">{Number(item.price).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</p>
                                                <p className="text-xs text-gray-500">Menge: x{item.quantity}</p>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="p-4 bg-gray-50 flex justify-between items-center text-lg font-black">
                                        <span>Gesamtbetrag:</span>
                                        <span className="text-red-600">{Number(selectedOrder.total_amount).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</span>
                                    </div>
                                </div>
                            </div>

                            {/* Management Section */}
                            <div className="pt-6 border-t border-gray-200">
                                <Label className="text-sm font-bold mb-4 block">Bestellverwaltung</Label>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <Label className="text-xs font-semibold text-gray-500">Status ändern</Label>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant={selectedOrder.status === 'shipped' ? 'default' : 'outline'}
                                                className={selectedOrder.status === 'shipped' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                                                onClick={() => updateOrderStatus('shipped')}
                                                disabled={isSubmitting}
                                            >
                                                Versandt
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant={selectedOrder.status === 'completed' ? 'default' : 'outline'}
                                                className={selectedOrder.status === 'completed' ? 'bg-green-600 hover:bg-green-700' : ''}
                                                onClick={() => updateOrderStatus('completed')}
                                                disabled={isSubmitting}
                                            >
                                                Abgeschlossen
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-xs font-semibold text-gray-500">Sendungsnummer (DHL/UPS vb.)</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="Tracking Nr..."
                                                className="h-9 text-sm"
                                                defaultValue={selectedOrder.tracking_number}
                                                id="tracking-input"
                                            />
                                            <Button
                                                size="sm"
                                                className="bg-gray-800"
                                                onClick={() => updateOrderStatus(selectedOrder.status, document.getElementById('tracking-input').value)}
                                                disabled={isSubmitting}
                                            >
                                                Speichern
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <Dialog open={isCustomerModalOpen} onOpenChange={setIsCustomerModalOpen}>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-xl font-bold">{selectedCustomer?.name}</div>
                                <div className="text-sm font-normal text-gray-500 font-mono italic">
                                    {selectedCustomer?.customer_number || 'Kunde ohne Nummer'}
                                </div>
                            </div>
                        </DialogTitle>
                    </DialogHeader>

                    {selectedCustomer && (
                        <div className="space-y-6 py-4">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <Label className="text-gray-400 text-xs uppercase tracking-wider">Kontaktdaten</Label>
                                        <div className="mt-1 space-y-1">
                                            <p className="text-sm font-medium">{selectedCustomer.email}</p>
                                            <p className="text-sm text-gray-600 font-mono">{selectedCustomer.phone || 'Keine Telefonnummer'}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-gray-400 text-xs uppercase tracking-wider">Kundeninformationen</Label>
                                        <div className="mt-1 space-y-1">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-500">Gruppe:</span>
                                                <Badge variant="secondary">{selectedCustomer.customer_group}</Badge>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-500">Registriert am:</span>
                                                <span>{new Date(selectedCustomer.created_at).toLocaleDateString('de-DE')}</span>
                                            </div>
                                            {selectedCustomer.vat_id && (
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-gray-500">USt-IDNr.:</span>
                                                    <span className="font-mono text-xs">{selectedCustomer.vat_id}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <Label className="text-gray-400 text-xs uppercase tracking-wider">Anschrift</Label>
                                        <div className="mt-1 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                            {selectedCustomer.company && (
                                                <p className="font-bold mb-1">{selectedCustomer.company}</p>
                                            )}
                                            <p>{selectedCustomer.address_street || 'Keine Straße hinterlegt'}</p>
                                            <p>{selectedCustomer.address_zip} {selectedCustomer.address_city}</p>
                                            <p className="uppercase text-xs font-bold text-gray-400 mt-1">
                                                {selectedCustomer.address_country || 'Deutschland'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <Label className="text-gray-400 text-xs uppercase tracking-wider">Interne Notizen</Label>
                                <div className="mt-1 p-3 bg-yellow-50 text-yellow-800 text-xs rounded-lg border border-yellow-100 italic">
                                    {selectedCustomer.notes || 'Keine internen Notizen zu diesem Kunden vorhanden.'}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <Button variant="outline" size="sm">Sperren</Button>
                                <Button variant="outline" size="sm">Passwort zurücksetzen</Button>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCustomerModalOpen(false)}>Schließen</Button>
                        <Button className="bg-red-600 hover:bg-red-700">Profil bearbeiten</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            {renderInvoiceDialog()}


            {/* Manual backdrop for non-modal variant dialog */}
            {isVariantModalOpen && (
                <div
                    className="fixed inset-0 bg-black/50 dark:bg-black/80 z-[99]"
                    onClick={() => setIsVariantModalOpen(false)}
                />
            )}
            <Dialog open={isVariantModalOpen} onOpenChange={setIsVariantModalOpen} modal={false}>
                <DialogContent className="sm:max-w-[700px] max-h-[95vh] overflow-y-auto p-0 border-none shadow-2xl z-[100] fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 dark:bg-[#111] dark:border dark:border-white/10">
                    <DialogHeader className="p-6 bg-gray-50/50 dark:bg-white/5 border-b dark:border-white/5 flex flex-row items-center justify-between space-y-0">
                        <DialogTitle className="text-xl font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            <Layers className="w-5 h-5 text-red-600" />
                            {editingVariantIndex !== null ? 'Variante bearbeiten' : 'Neue Variante erstellen'}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="p-6 space-y-6 dark:bg-[#0a0a0a]">
                        {/* Attributes Section */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-[11px] uppercase tracking-widest text-gray-400 dark:text-gray-500 font-black">Eigenschaften (z.B. Farbe: Rot, Größe: XL)</Label>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-[10px] uppercase font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 px-2"
                                    onClick={() => {
                                        setVariantFormData({
                                            ...variantFormData,
                                            attributes: [...variantFormData.attributes, { label: '', value: '' }]
                                        });
                                    }}
                                >
                                    <PlusCircle className="w-3.5 h-3.5 mr-1" />
                                    Eigenschaft hinzufügen
                                </Button>
                            </div>
                            <div className="space-y-2">
                                {variantFormData.attributes.map((attr, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <div className="grid grid-cols-2 gap-2 flex-1">
                                            <Input
                                                value={attr.label || ''}
                                                onChange={(e) => {
                                                    const newAttrs = [...variantFormData.attributes];
                                                    newAttrs[idx].label = e.target.value;
                                                    setVariantFormData({ ...variantFormData, attributes: newAttrs });
                                                }}
                                                placeholder="z.B. Farbe"
                                                className="h-10 bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 dark:text-white"
                                            />
                                            <Input
                                                value={attr.value || ''}
                                                onChange={(e) => {
                                                    const newAttrs = [...variantFormData.attributes];
                                                    newAttrs[idx].value = e.target.value;
                                                    setVariantFormData({ ...variantFormData, attributes: newAttrs });
                                                }}
                                                placeholder="z.B. Rot"
                                                className="h-10 bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 dark:text-white font-bold"
                                            />
                                        </div>
                                        {variantFormData.attributes.length > 1 && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-10 w-10 text-gray-300 hover:text-red-500 dark:hover:text-red-400"
                                                onClick={() => {
                                                    const newAttrs = variantFormData.attributes.filter((_, i) => i !== idx);
                                                    setVariantFormData({ ...variantFormData, attributes: newAttrs });
                                                }}
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Basic Info: SKU, Price, Stock */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div className="space-y-1.5 col-span-2 sm:col-span-1">
                                <Label className="text-[11px] uppercase tracking-wider text-gray-400 dark:text-gray-500 font-bold italic">Artikelnummer</Label>
                                <Input
                                    value={variantFormData.sku || ''}
                                    onChange={(e) => setVariantFormData({ ...variantFormData, sku: e.target.value })}
                                    placeholder="SKU-123"
                                    className="h-10 bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 dark:text-white"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[11px] uppercase tracking-wider text-gray-400 dark:text-gray-500 font-bold italic">VK-Preis (Netto/Brutto)</Label>
                                <div className="relative">
                                    <Input
                                        value={variantFormData.price || ''}
                                        onChange={(e) => setVariantFormData({ ...variantFormData, price: e.target.value })}
                                        placeholder="0,00"
                                        className="h-10 pl-7 bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 dark:text-white"
                                    />
                                    <Euro className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[11px] uppercase tracking-wider text-gray-400 dark:text-gray-500 font-bold italic">Händler Preis</Label>
                                <div className="relative">
                                    <Input
                                        value={variantFormData.dealer_price || ''}
                                        onChange={(e) => setVariantFormData({ ...variantFormData, dealer_price: e.target.value })}
                                        placeholder="0,00"
                                        className="h-10 pl-7 bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 dark:text-white"
                                    />
                                    <Euro className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[11px] uppercase tracking-wider text-gray-400 dark:text-gray-500 font-bold italic">Lagerbestand</Label>
                                <Input
                                    type="number"
                                    value={variantFormData.stock || ''}
                                    onChange={(e) => setVariantFormData({ ...variantFormData, stock: e.target.value })}
                                    placeholder="0"
                                    className="h-10 bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 dark:text-white"
                                />
                            </div>
                        </div>

                        {/* Description Section */}
                        <div className="space-y-2">
                            <Label className="text-[11px] uppercase tracking-widest text-gray-400 dark:text-gray-500 font-black italic">Variantenbeschreibung (Optional)</Label>
                            <div className="quill-dark-container" onMouseDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
                                <ReactQuill
                                    theme="snow"
                                    value={variantFormData.description || ''}
                                    modules={variantModules}
                                    onChange={(content) => setVariantFormData(prev => ({ ...prev, description: content }))}
                                    placeholder="Spezifische Beschreibung für diese Variante..."
                                />
                            </div>
                        </div>

                        {/* Images Section */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-[11px] uppercase tracking-widest text-gray-400 font-black italic flex items-center gap-1.5">
                                    <ImageIcon className="w-3.5 h-3.5" />
                                    Bilder für diese Variante
                                </Label>
                                <div className="relative">
                                    <input
                                        type="file"
                                        id="variant-multi-upload"
                                        className="hidden"
                                        accept="image/*"
                                        multiple
                                        onChange={(e) => handleVariantImageUpload(e, null)}
                                        disabled={isUploading}
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="h-8 border-red-100 text-red-600 hover:bg-red-50"
                                        onClick={() => document.getElementById('variant-multi-upload').click()}
                                        disabled={isUploading}
                                    >
                                        {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Upload className="w-3.5 h-3.5 mr-1.5" />}
                                        Bilder hochladen
                                    </Button>
                                </div>
                            </div>

                            {/* Image Grid */}
                            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                                {variantFormData.images.map((url, imgIdx) => (
                                    <div key={imgIdx} className="relative group aspect-square rounded-lg border border-gray-100 bg-white overflow-hidden shadow-sm">
                                        <img src={url} alt="" className="w-full h-full object-contain" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 text-white hover:text-red-400"
                                                onClick={() => {
                                                    const newImgs = variantFormData.images.filter((_, i) => i !== imgIdx);
                                                    setVariantFormData({ ...variantFormData, images: newImgs });
                                                }}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                                {/* Empty/Placeholder if no images */}
                                {variantFormData.images.length === 0 && (
                                    <div className="col-span-full py-8 border-2 border-dashed border-gray-100 rounded-xl flex flex-col items-center justify-center text-gray-300">
                                        <ImageIcon className="w-8 h-8 opacity-20" />
                                        <p className="text-[10px] uppercase font-bold mt-2">Noch keine Bilder hochgeladen</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="p-6 bg-gray-50 dark:bg-white/5 border-t dark:border-white/5 mt-auto">
                        <Button variant="outline" className="dark:bg-transparent dark:text-gray-400 dark:border-white/10" onClick={() => setIsVariantModalOpen(false)}>Abbrechen</Button>
                        <Button
                            className="bg-gray-900 dark:bg-white dark:text-black hover:bg-black dark:hover:bg-gray-200 px-8 font-bold"
                            onClick={saveVariantModal}
                        >
                            Variante Speichern
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <Dialog open={isLegalEditorOpen} onOpenChange={setIsLegalEditorOpen}>
                <DialogContent 
                    className="sm:max-w-[950px] max-h-[92vh] flex flex-col p-0 shadow-2xl dark:bg-[#111] dark:border-white/10 overflow-hidden"
                    onInteractOutside={(e) => e.preventDefault()}
                    onOpenAutoFocus={(e) => e.preventDefault()}
                    onCloseAutoFocus={(e) => e.preventDefault()}
                >
                    <DialogHeader className="p-6 border-b dark:border-white/5">
                        <DialogTitle className="flex items-center gap-2 dark:text-gray-100">
                            <FileText className="w-5 h-5 text-red-600" />
                            {currentLegalDoc?.label} bearbeiten
                        </DialogTitle>
                        <DialogDescription className="text-gray-400 text-xs">
                            Ändern Sie hier den Inhalt Ihres rechtlichen Dokuments.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50 dark:bg-[#0a0a0a]">
                        <Card className="border dark:border-white/10 shadow-none">
                            <CardContent className="p-0 quill-dark-container relative">
                                <ReactQuill
                                    key={`quill-${currentLegalDoc?.id}-${lastSaveTimestamp}`}
                                    theme="snow"
                                    value={legalContent}
                                    modules={quillModules}
                                    formats={quillFormats}
                                    onChange={(val) => {
                                        setLegalContent(val);
                                        legalContentRef.current = val;
                                    }}
                                    placeholder="Inhalt hier eingeben..."
                                    style={{ height: '500px', marginBottom: '40px' }}
                                />
                            </CardContent>
                        </Card>
                        <div className="mt-4 flex items-start gap-2 p-3 bg-blue-50 text-blue-700 rounded-lg text-xs leading-relaxed border border-blue-100 italic">
                            <Bell className="w-4 h-4 mt-0.5 shrink-0" />
                            Hinweis: Änderungen wirken sich direkt auf die entsprechenden Unterseiten Ihrer Website aus.
                        </div>
                    </div>

                    <DialogFooter className="p-6 bg-white dark:bg-[#111] border-t dark:border-white/5 mt-auto">
                        <Button variant="outline" className="dark:bg-transparent dark:text-gray-400 dark:border-white/10" onClick={() => setIsLegalEditorOpen(false)}>Abbrechen</Button>
                        <Button
                            className="bg-red-600 hover:bg-red-700 text-white font-bold"
                            onClick={async () => {
                                setIsSubmitting(true);
                                const tid = toast.loading('Speichere...');
                                console.log("💾 [ADMIN] Finalizing Legal Doc Save...");
                                
                                try {
                                    const contentToSave = legalContentRef.current || legalContent || '';

                                    const updatedDocs = (settingsForm.legalDocs || []).map(d =>
                                        d.id === currentLegalDoc.id ? { ...d, content: contentToSave } : d
                                    );
                                    
                                    const finalState = {
                                        ...shopSettings, // Keep global properties
                                        ...settingsForm, // Overwrite with local form changes
                                        legalDocs: updatedDocs // Apply the newly typed document text
                                    };

                                    // Fire off the API call
                                    await updateShopSettings(finalState);
                                    
                                    // Update React form state after successful DB save
                                    setSettingsForm(finalState);
                                    
                                    // FORCE refresh of editor for the NEXT opening
                                    setLastSaveTimestamp(Date.now());
                                    
                                    toast.success(`${currentLegalDoc.label} erfolgreich gespeichert ✓`, { id: tid });
                                    setTimeout(() => setIsLegalEditorOpen(false), 400);
                                } catch (err) {
                                    console.error("❌ [ADMIN] Legal Save Failed:", err);
                                    toast.error('Fehler: ' + (err.message || 'Verbindungsfehler'), { id: tid });
                                } finally {
                                    setIsSubmitting(false);
                                }
                            }}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Speichere...
                                </>
                            ) : `${currentLegalDoc?.label} Speichern`}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog >
        </div >
    );
};
export default AdminDashboard;
