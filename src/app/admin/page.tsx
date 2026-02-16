'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    collection, addDoc, getDocs, deleteDoc, doc,
    query, orderBy, updateDoc, setDoc, where
} from 'firebase/firestore';
import { db, storage } from '@/lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { useAuth } from '@/contexts/auth-context';
import { Question } from '@/types';
import Sidebar from '@/components/Sidebar';
import MathEditor, { MathEditorRef } from '@/components/MathEditor';
import MathCalculator from '@/components/MathCalculator';
import RichTextContent from '@/components/RichTextContent';
import {
    Plus, Trash2, Save, Loader2, BookOpen,
    CheckCircle, FileText, Shield, Edit3,
    Users, Search, Calendar, ShieldOff,
    Atom, FlaskConical, Leaf, Calculator, Globe,
    Briefcase, Brain, PenTool, Music, Code, LineChart, Star, Palette
} from 'lucide-react';
import toast from 'react-hot-toast';

interface UserData {
    uid: string;
    email: string;
    name: string;
    role: 'student' | 'admin';
    status?: 'active' | 'inactive';
    createdAt: any;
}

interface Textbook {
    id: string;
    grade: number;
    subjectId: string;
    subjectName: string;
    stream: string;
    studentBookUrl?: string;
    teacherGuideUrl?: string;
    createdAt: any;
}

export default function AdminPage() {
    const { user, userData, loading: authLoading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    // Get active view from URL, default to 'questions'
    const activeTab = (searchParams.get('view') as 'questions' | 'users' | 'subjects' | 'textbooks') || 'questions';

    // Questions State
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loadingQuestions, setLoadingQuestions] = useState(true);
    const [savingQuestion, setSavingQuestion] = useState(false);

    // Users State
    const [usersList, setUsersList] = useState<UserData[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [userSearch, setUserSearch] = useState('');

    // Subject Form State
    const [subjectsList, setSubjectsList] = useState<any[]>([]);
    const [newSubjectName, setNewSubjectName] = useState('');
    const [newSubjectDesc, setNewSubjectDesc] = useState('');
    const [newSubjectSections, setNewSubjectSections] = useState<string[]>(['natural']);
    const [newSubjectIcon, setNewSubjectIcon] = useState('general');
    const [newSubjectColor, setNewSubjectColor] = useState('blue');
    const [newSubjectDuration, setNewSubjectDuration] = useState<number>(60); // Default 60 mins
    const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
    const [savingSubject, setSavingSubject] = useState(false);

    // Textbook Management State
    const [textbooks, setTextbooks] = useState<any[]>([]);
    const [loadingTextbooks, setLoadingTextbooks] = useState(false);
    const [uploadingTextbook, setUploadingTextbook] = useState(false);
    const [textbookForm, setTextbookForm] = useState({
        grade: 12,
        subjectId: '',
        stream: 'natural' as 'natural' | 'social' | 'none',
        studentBookFile: null as File | null,
        teacherGuideFile: null as File | null
    });
    const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

    // New question form
    const [subject, setSubject] = useState('');
    const [section, setSection] = useState<'natural' | 'social' | 'freshman'>('natural');
    const [questionText, setQuestionText] = useState('');
    const [year, setYear] = useState(new Date().getFullYear().toString());
    const [options, setOptions] = useState(['', '', '', '']);
    const [correctAnswer, setCorrectAnswer] = useState(0);

    // Question Management State
    const [questionSearch, setQuestionSearch] = useState('');
    const [filterSubject, setFilterSubject] = useState<string>('all');
    const [filterSection, setFilterSection] = useState<string>('all');
    const [filterYear, setFilterYear] = useState<string>('all');
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

    // Filtered Questions
    const filteredQuestions = questions.filter(q => {
        const matchesSearch = questionSearch === '' ||
            q.question.toLowerCase().includes(questionSearch.toLowerCase());
        const matchesSubject = filterSubject === 'all' || q.subjectId === filterSubject;
        const matchesSection = filterSection === 'all' || q.section === filterSection;
        const matchesYear = filterYear === 'all' || q.year === filterYear;
        return matchesSearch && matchesSubject && matchesSection && matchesYear;
    });

    // Get unique years from questions
    const uniqueYears = [...new Set(questions.map(q => q.year).filter(Boolean))].sort().reverse();

    // Edit question handler
    const handleEditQuestion = (q: Question) => {
        setEditingQuestion(q);
        setSubject(q.subjectId);
        setSection(q.section as any);
        setQuestionText(q.question);
        setYear(q.year || '');
        setOptions(q.options);
        setCorrectAnswer(q.correctAnswer);
        // Scroll to form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Cancel question edit
    const handleCancelQuestionEdit = () => {
        setEditingQuestion(null);
        setSubject('');
        setSection('natural');
        setQuestionText('');
        setYear(new Date().getFullYear().toString());
        setOptions(['', '', '', '']);
        setCorrectAnswer(0);
    };

    // Math Calculator Integration
    const [showCalculator, setShowCalculator] = useState(false);
    const [activeField, setActiveField] = useState<string | null>('question'); // Default to question
    const questionEditorRef = useRef<MathEditorRef>(null);
    const optionEditorRefs = useRef<(MathEditorRef | null)[]>([null, null, null, null]);

    const handleInsertLaTeX = (latex: string) => {
        // Default to question field if no field is active
        const targetField = activeField || 'question';

        // Handle CLEAR action from AC button
        if (latex === '') {
            if (targetField === 'question') {
                questionEditorRef.current?.clear();
            } else if (targetField.startsWith('option-')) {
                const index = parseInt(targetField.split('-')[1]);
                optionEditorRefs.current[index]?.clear();
            }
            return;
        }

        if (targetField === 'question') {
            // Focus the editor first, then insert
            questionEditorRef.current?.focus();
            setTimeout(() => {
                questionEditorRef.current?.insertLaTeX(latex);
            }, 50);
        } else if (targetField.startsWith('option-')) {
            const index = parseInt(targetField.split('-')[1]);
            optionEditorRefs.current[index]?.focus();
            setTimeout(() => {
                optionEditorRefs.current[index]?.insertLaTeX(latex);
            }, 50);
        }
    };

    // Check admin access
    useEffect(() => {
        if (!authLoading && (!user || userData?.role !== 'admin')) {
            toast.error('Admin access required');
            router.push('/');
        }
    }, [user, userData, authLoading, router]);

    // Initial Data Fetch
    useEffect(() => {
        if (user && userData?.role === 'admin') {
            fetchSubjects();
            fetchQuestions();
            if (activeTab === 'users') {
                fetchUsers();
            }
            if (activeTab === 'textbooks') {
                fetchTextbooks();
            }
        }
    }, [user, userData, activeTab]);

    const fetchTextbooks = async () => {
        setLoadingTextbooks(true);
        try {
            const q = query(collection(db, 'textbooks'), orderBy('grade'), orderBy('subjectName'));
            const snapshot = await getDocs(q);
            setTextbooks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Textbook[]);
        } catch (error) {
            console.error('Error fetching textbooks:', error);
            toast.error('Failed to load textbooks');
        } finally {
            setLoadingTextbooks(false);
        }
    };

    const handleUploadTextbook = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!textbookForm.subjectId) {
            toast.error('Please select a subject');
            return;
        }
        if (!textbookForm.studentBookFile && !textbookForm.teacherGuideFile) {
            toast.error('Please select at least one file to upload');
            return;
        }

        setUploadingTextbook(true);
        setUploadProgress({});

        try {
            const subjectData = subjectsList.find(s => s.id === textbookForm.subjectId);
            const textbookId = `${textbookForm.grade}-${textbookForm.subjectId}-${textbookForm.stream}`;

            const uploadFile = async (file: File, type: 'student-book' | 'teachers-guide') => {
                const path = `textbooks/grade-${textbookForm.grade}/${textbookForm.subjectId}/${type}.pdf`;
                const storageRef = ref(storage, path);
                const uploadTask = uploadBytesResumable(storageRef, file);

                return new Promise<string>((resolve, reject) => {
                    uploadTask.on('state_changed',
                        (snapshot) => {
                            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                            setUploadProgress(prev => ({ ...prev, [type]: progress }));
                        },
                        (error) => {
                            console.error(`Error uploading ${type}:`, error);
                            reject(error);
                        },
                        async () => {
                            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                            resolve(downloadURL);
                        }
                    );
                });
            };

            const uploadPromises: Promise<any>[] = [];
            if (textbookForm.studentBookFile) {
                uploadPromises.push(uploadFile(textbookForm.studentBookFile, 'student-book'));
            } else {
                uploadPromises.push(Promise.resolve(''));
            }

            if (textbookForm.teacherGuideFile) {
                uploadPromises.push(uploadFile(textbookForm.teacherGuideFile, 'teachers-guide'));
            } else {
                uploadPromises.push(Promise.resolve(''));
            }

            const [studentBookUrl, teacherGuideUrl] = await Promise.all(uploadPromises);

            const textbookData = {
                grade: textbookForm.grade,
                subjectId: textbookForm.subjectId,
                subjectName: subjectData?.name || textbookForm.subjectId,
                stream: textbookForm.stream,
                ...(studentBookUrl && { studentBookUrl }),
                ...(teacherGuideUrl && { teacherGuideUrl }),
                updatedAt: new Date()
            };

            await setDoc(doc(db, 'textbooks', textbookId), textbookData, { merge: true });

            toast.success('Textbook uploaded successfully!');
            fetchTextbooks();
            // Reset files and progress
            setTextbookForm(prev => ({ ...prev, studentBookFile: null, teacherGuideFile: null }));
            setUploadProgress({});
        } catch (error) {
            console.error('Error uploading textbook:', error);
            toast.error('Failed to upload textbook');
        } finally {
            setUploadingTextbook(false);
        }
    };

    const handleDeleteTextbook = async (textbook: Textbook) => {
        if (!confirm('Are you sure you want to delete this textbook entry?')) return;

        try {
            // Delete files from storage if they exist
            if (textbook.studentBookUrl) {
                const studentRef = ref(storage, `textbooks/grade-${textbook.grade}/${textbook.subjectId}/student-book.pdf`);
                await deleteObject(studentRef).catch(e => console.error('Error deleting student book file', e));
            }
            if (textbook.teacherGuideUrl) {
                const teacherRef = ref(storage, `textbooks/grade-${textbook.grade}/${textbook.subjectId}/teachers-guide.pdf`);
                await deleteObject(teacherRef).catch(e => console.error('Error deleting teacher guide file', e));
            }

            await deleteDoc(doc(db, 'textbooks', textbook.id));
            setTextbooks(prev => prev.filter(t => t.id !== textbook.id));
            toast.success('Textbook entry deleted');
        } catch (error) {
            console.error('Error deleting textbook:', error);
            toast.error('Failed to delete textbook');
        }
    };

    const fetchSubjects = async () => {
        try {
            const q = query(collection(db, 'subjects'), orderBy('name'));
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setSubjectsList(data);
            if (data.length > 0 && !subject) {
                setSubject(data[0].id);
            }
        } catch (error) {
            console.error('Error fetching subjects', error);
        }
    };

    const fetchQuestions = async () => {
        try {
            const questionsRef = collection(db, 'questions');
            const q = query(questionsRef, orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);
            const questionsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            })) as Question[];
            setQuestions(questionsData);
        } catch (error) {
            console.error('Error fetching questions:', error);
        } finally {
            setLoadingQuestions(false);
        }
    };

    const fetchUsers = async () => {
        setLoadingUsers(true);
        try {
            const usersRef = collection(db, 'users');
            const q = query(usersRef);
            const snapshot = await getDocs(q);
            const usersData = snapshot.docs.map(doc => ({
                uid: doc.id,
                ...doc.data(),
            })) as UserData[];

            setUsersList(usersData.sort((a, b) => {
                const dateA = a.createdAt?.seconds ? new Date(a.createdAt.seconds * 1000) : new Date(a.createdAt);
                const dateB = b.createdAt?.seconds ? new Date(b.createdAt.seconds * 1000) : new Date(b.createdAt);
                return dateB.getTime() - dateA.getTime();
            }));
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Failed to load users');
        } finally {
            setLoadingUsers(false);
        }
    };

    const handleAddQuestion = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!subject) {
            toast.error('Please select a subject');
            return;
        }
        if (!questionText.trim() || options.some(opt => !opt.trim())) {
            toast.error('Please fill all fields');
            return;
        }

        setSavingQuestion(true);
        try {
            const questionData = {
                subjectId: subject,
                section: section,
                question: questionText,
                options: options,
                correctAnswer: correctAnswer,
                year: year,
                type: 'mcq' as const,
            };

            if (editingQuestion) {
                // Update existing question
                const questionRef = doc(db, 'questions', editingQuestion.id);
                await updateDoc(questionRef, {
                    ...questionData,
                    updatedAt: new Date(),
                });

                setQuestions(prev => prev.map(q =>
                    q.id === editingQuestion.id
                        ? { ...q, ...questionData }
                        : q
                ));

                // Clear edit mode
                setEditingQuestion(null);
                toast.success('Question updated successfully!');
            } else {
                // Add new question
                const newQuestion = {
                    ...questionData,
                    createdAt: new Date(),
                };

                const docRef = await addDoc(collection(db, 'questions'), newQuestion);

                // Update subject count
                const subjectRef = doc(db, 'subjects', subject);
                const qColl = collection(db, 'questions');
                const qSnapshot = await getDocs(query(qColl, where('subjectId', '==', subject)));
                await updateDoc(subjectRef, { questionCount: qSnapshot.size });

                setQuestions(prev => [{ ...newQuestion, id: docRef.id }, ...prev]);
                toast.success('Question added successfully!');
            }

            // Reset form
            setQuestionText('');
            setOptions(['', '', '', '']);
            setCorrectAnswer(0);
        } catch (error) {
            console.error('Error saving question:', error);
            toast.error(editingQuestion ? 'Failed to update question' : 'Failed to add question');
        } finally {
            setSavingQuestion(false);
        }
    };

    const handleAddSubject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSubjectName.trim()) return;

        setSavingSubject(true);
        try {
            if (editingSubjectId) {
                const subjectRef = doc(db, 'subjects', editingSubjectId);
                const updatedSub = {
                    name: newSubjectName,
                    description: newSubjectDesc,
                    sections: newSubjectSections,
                    icon: newSubjectIcon,
                    color: newSubjectColor,
                    duration: newSubjectDuration
                };
                await updateDoc(subjectRef, updatedSub);
                setSubjectsList(prev => prev.map(s => s.id === editingSubjectId ? { ...s, ...updatedSub } : s));
                toast.success('Subject updated successfully!');
            } else {
                const id = newSubjectName.toLowerCase().replace(/\s+/g, '-');
                const newSub = {
                    name: newSubjectName,
                    description: newSubjectDesc,
                    icon: newSubjectIcon,
                    color: newSubjectColor,
                    questionCount: 0,
                    sections: newSubjectSections,
                    duration: newSubjectDuration,
                };
                await setDoc(doc(db, 'subjects', id), newSub);
                setSubjectsList(prev => [...prev, { id, ...newSub }]);
                toast.success('Subject added successfully!');
            }

            setNewSubjectName('');
            setNewSubjectDesc('');
            setNewSubjectSections(['natural']);
            setNewSubjectIcon('general');
            setNewSubjectColor('blue');
            setNewSubjectDuration(60);
            setEditingSubjectId(null);
        } catch (error) {
            console.error('Error saving subject:', error);
            toast.error('Failed to save subject');
        } finally {
            setSavingSubject(false);
        }
    };

    const handleEditSubject = (s: any) => {
        setEditingSubjectId(s.id);
        setNewSubjectName(s.name);
        setNewSubjectDesc(s.description || '');
        setNewSubjectSections(s.sections || ['natural']);
        setNewSubjectIcon(s.icon || 'general');
        setNewSubjectColor(s.color || 'blue');
        setNewSubjectDuration(s.duration || 60);
        // Scroll to form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelSubjectEdit = () => {
        setEditingSubjectId(null);
        setNewSubjectName('');
        setNewSubjectDesc('');
        setNewSubjectSections(['natural']);
        setNewSubjectIcon('general');
        setNewSubjectColor('blue');
        setNewSubjectDuration(60);
    };

    const handleDeleteQuestion = async (questionId: string) => {
        if (!confirm('Are you sure you want to delete this question?')) return;
        try {
            await deleteDoc(doc(db, 'questions', questionId));
            setQuestions(prev => prev.filter(q => q.id !== questionId));
            toast.success('Question deleted');
        } catch (error) {
            console.error('Error deleting question:', error);
            toast.error('Failed to delete question');
        }
    };

    const handleToggleRole = async (targetUserId: string, currentRole: string) => {
        if (targetUserId === user?.uid) {
            toast.error("You cannot change your own role");
            return;
        }

        const newRole = currentRole === 'admin' ? 'student' : 'admin';
        const confirmMsg = newRole === 'admin'
            ? "Promote this user to Admin?"
            : "Revoke Admin access from this user?";

        if (!confirm(confirmMsg)) return;

        try {
            const userRef = doc(db, 'users', targetUserId);
            await updateDoc(userRef, { role: newRole });

            if (newRole === 'admin') {
                const userDoc = usersList.find(u => u.uid === targetUserId);
                if (userDoc) {
                    await setDoc(doc(db, 'admins', targetUserId), {
                        email: userDoc.email,
                        name: userDoc.name,
                        createdAt: new Date()
                    });
                }
            } else {
                await deleteDoc(doc(db, 'admins', targetUserId));
            }

            setUsersList(prev => prev.map(u =>
                u.uid === targetUserId ? { ...u, role: newRole } : u
            ));
            toast.success(`User role updated to ${newRole}`);
        } catch (error) {
            console.error('Error updating role:', error);
            toast.error('Failed to update user role');
        }
    };

    const handleToggleStatus = async (targetUserId: string, currentStatus: string) => {
        if (targetUserId === user?.uid) {
            toast.error("You cannot deactivate your own account");
            return;
        }

        const newStatus = currentStatus === 'inactive' ? 'active' : 'inactive';
        const confirmMsg = newStatus === 'inactive'
            ? "Deactivate this user account? They will be unable to log in."
            : "Reactivate this user account?";

        if (!confirm(confirmMsg)) return;

        try {
            const userRef = doc(db, 'users', targetUserId);
            await updateDoc(userRef, { status: newStatus });

            setUsersList(prev => prev.map(u =>
                u.uid === targetUserId ? { ...u, status: newStatus } : u
            ));
            toast.success(`User is now ${newStatus}`);
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status');
        }
    };

    const handleDeleteUser = async (targetUserId: string) => {
        if (targetUserId === user?.uid) {
            toast.error("You cannot delete your own account");
            return;
        }

        if (!confirm("Are you sure you want to PERMANENTLY delete this user? This cannot be undone.")) return;

        try {
            // Delete from users collection
            await deleteDoc(doc(db, 'users', targetUserId));
            // Try to delete from admins collection if they were an admin
            await deleteDoc(doc(db, 'admins', targetUserId));

            setUsersList(prev => prev.filter(u => u.uid !== targetUserId));
            toast.success('User permanently deleted');
        } catch (error) {
            console.error('Error deleting user:', error);
            toast.error('Failed to delete user');
        }
    };

    // Filter users
    const filteredUsers = usersList.filter(u =>
        u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email?.toLowerCase().includes(userSearch.toLowerCase())
    );

    if (authLoading || (!user || userData?.role !== 'admin')) {
        return (
            <div className="min-h-screen flex items-center justify-center premium-bg">
                <Loader2 className="w-10 h-10 text-white animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen premium-bg flex text-white">
            <Sidebar />

            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl" />
            </div>

            {/* Layout Spacer - Matches Sidebar Width */}
            <div className="hidden md:block w-[80px] xl:w-[280px] shrink-0 transition-all duration-300" />

            <main className="flex-1 min-w-0 relative p-4 md:p-8 transition-all duration-300">
                <div className="max-w-7xl mx-auto w-full">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                                    <Shield className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
                                    <p className="text-gray-400">
                                        {activeTab === 'questions' && 'Manage Exam Questions'}
                                        {activeTab === 'subjects' && 'Manage Subjects'}
                                        {activeTab === 'users' && 'Manage Users & Roles'}
                                    </p>
                                </div>
                            </div>

                            {/* Tabs Removed - Controlled by Sidebar Selection via URL */}

                        </div>
                    </motion.div>

                    {/* QUESTIONS TAB */}
                    {activeTab === 'questions' && (
                        <div className="grid lg:grid-cols-2 gap-8">
                            {/* Add Question Form */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="glass-card rounded-3xl p-8 overflow-hidden h-fit"
                            >
                                <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl" />

                                <h2 className="relative text-xl font-bold text-white mb-8 flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${editingQuestion ? 'from-amber-500 to-orange-600' : 'from-blue-500 to-purple-600'} flex items-center justify-center`}>
                                        {editingQuestion ? <Edit3 className="w-5 h-5 text-white" /> : <Plus className="w-5 h-5 text-white" />}
                                    </div>
                                    {editingQuestion ? 'Edit Question' : 'Add New Question'}
                                    {editingQuestion && (
                                        <button
                                            type="button"
                                            onClick={handleCancelQuestionEdit}
                                            className="ml-auto px-3 py-1.5 text-xs bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </h2>

                                <form onSubmit={handleAddQuestion} className="relative space-y-6">
                                    {/* Subject */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="block text-sm font-medium text-gray-300">Subject</label>
                                            <button
                                                type="button"
                                                onClick={() => router.push('/admin?view=subjects')}
                                                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                                            >
                                                <Plus className="w-3 h-3" /> Add Subject
                                            </button>
                                        </div>
                                        <select
                                            value={subject}
                                            onChange={(e) => setSubject(e.target.value)}
                                            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 text-white"
                                        >
                                            <option value="" disabled>Select a Subject</option>
                                            {subjectsList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                        </select>
                                    </div>

                                    {/* Section */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Section</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {[
                                                { id: 'natural', label: 'Natural' },
                                                { id: 'social', label: 'Social' },
                                                { id: 'freshman', label: 'Freshman' }
                                            ].map((s) => (
                                                <button
                                                    key={s.id}
                                                    type="button"
                                                    onClick={() => setSection(s.id as any)}
                                                    className={`py-2 px-3 rounded-xl text-sm font-medium border transition-all ${section === s.id
                                                        ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20'
                                                        : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:bg-gray-800'
                                                        }`}
                                                >
                                                    {s.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Year */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Exam Year (e.g. 2017)</label>
                                        <input
                                            type="text"
                                            value={year}
                                            onChange={(e) => setYear(e.target.value)}
                                            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 text-white"
                                            placeholder="2017"
                                        />
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="block text-sm font-medium text-gray-300">Question (supports Rich Text & Math)</label>
                                            <button
                                                type="button"
                                                onClick={() => setShowCalculator(!showCalculator)}
                                                className={`flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-bold transition-all ${showCalculator ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
                                            >
                                                <Calculator className="w-3 h-3" />
                                                Math Tools
                                            </button>
                                        </div>
                                        <MathEditor
                                            ref={questionEditorRef}
                                            value={questionText}
                                            onChange={setQuestionText}
                                            onFocus={() => setActiveField('question')}
                                            placeholder="Write your question... Use the omega sign or click 'Math Tools' for formulas."
                                        />
                                    </div>

                                    {/* Options */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-3">
                                            Options (supports Rich Text & Math)
                                        </label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {options.map((opt, idx) => (
                                                <div key={idx} className="relative group">
                                                    <button
                                                        type="button"
                                                        onClick={() => setCorrectAnswer(idx)}
                                                        title="Set as correct answer"
                                                        className={`absolute -left-3 top-4 w-7 h-7 rounded-lg border flex items-center justify-center text-[10px] font-black z-10 transition-all cursor-pointer shadow-lg
                                                            ${correctAnswer === idx
                                                                ? 'bg-emerald-500 border-emerald-400 text-white scale-110 rotate-3 shadow-emerald-500/40'
                                                                : 'bg-gray-700 border-gray-600 text-gray-400 hover:border-gray-500 group-focus-within:bg-blue-600 group-focus-within:text-white'
                                                            }`}
                                                    >
                                                        {correctAnswer === idx ? <CheckCircle className="w-4 h-4" /> : ['A', 'B', 'C', 'D'][idx]}
                                                    </button>
                                                    <MathEditor
                                                        ref={(el) => { optionEditorRefs.current[idx] = el; }}
                                                        value={opt}
                                                        onChange={(val) => {
                                                            const newOpts = [...options];
                                                            newOpts[idx] = val;
                                                            setOptions(newOpts);
                                                        }}
                                                        onFocus={() => setActiveField(`option-${idx}`)}
                                                        placeholder={`Option ${['A', 'B', 'C', 'D'][idx]}...`}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={savingQuestion}
                                        className={`w-full py-4 bg-gradient-to-r ${editingQuestion ? 'from-amber-500 to-orange-600 hover:shadow-amber-500/25' : 'from-blue-600 to-purple-600 hover:shadow-blue-500/25'} text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all disabled:opacity-50`}
                                    >
                                        {savingQuestion ? <Loader2 className="animate-spin w-5 h-5" /> : <><Save className="w-5 h-5" /> {editingQuestion ? 'Update Question' : 'Save Question'}</>}
                                    </button>
                                </form>
                            </motion.div>

                            {/* Questions List */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="glass-card rounded-3xl p-6 overflow-hidden flex flex-col h-[850px]"
                            >
                                <div className="absolute top-0 left-0 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl" />

                                {/* Header */}
                                <div className="relative flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-bold text-white flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                                            <FileText className="w-5 h-5 text-white" />
                                        </div>
                                        Question Bank
                                    </h2>
                                    <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-sm rounded-lg font-bold">
                                        {filteredQuestions.length} / {questions.length}
                                    </span>
                                </div>

                                {/* Search Bar */}
                                <div className="relative mb-4">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input
                                        type="text"
                                        value={questionSearch}
                                        onChange={(e) => setQuestionSearch(e.target.value)}
                                        placeholder="Search questions..."
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white text-sm placeholder:text-gray-500 focus:ring-2 focus:ring-purple-500/50"
                                    />
                                </div>

                                {/* Filters */}
                                <div className="grid grid-cols-3 gap-2 mb-4">
                                    <select
                                        value={filterSubject}
                                        onChange={(e) => setFilterSubject(e.target.value)}
                                        className="px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-xl text-gray-300 text-xs focus:ring-2 focus:ring-purple-500/50"
                                    >
                                        <option value="all">All Subjects</option>
                                        {subjectsList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                    <select
                                        value={filterSection}
                                        onChange={(e) => setFilterSection(e.target.value)}
                                        className="px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-xl text-gray-300 text-xs focus:ring-2 focus:ring-purple-500/50"
                                    >
                                        <option value="all">All Sections</option>
                                        <option value="natural">Natural</option>
                                        <option value="social">Social</option>
                                        <option value="freshman">Freshman</option>
                                    </select>
                                    <select
                                        value={filterYear}
                                        onChange={(e) => setFilterYear(e.target.value)}
                                        className="px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-xl text-gray-300 text-xs focus:ring-2 focus:ring-purple-500/50"
                                    >
                                        <option value="all">All Years</option>
                                        {uniqueYears.map(y => <option key={y} value={y}>{y}</option>)}
                                    </select>
                                </div>

                                {/* Edit Mode Indicator */}
                                {editingQuestion && (
                                    <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-amber-400 text-sm">
                                            <Edit3 className="w-4 h-4" />
                                            <span className="font-medium">Editing Question</span>
                                        </div>
                                        <button
                                            onClick={handleCancelQuestionEdit}
                                            className="px-3 py-1 text-xs bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
                                        >
                                            Cancel Edit
                                        </button>
                                    </div>
                                )}

                                {/* Questions List */}
                                <div className="relative flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                                    {loadingQuestions ? (
                                        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-purple-400" /></div>
                                    ) : filteredQuestions.length === 0 ? (
                                        <div className="text-center py-20 text-gray-500">
                                            {questions.length === 0 ? 'No questions found.' : 'No questions match your filters.'}
                                        </div>
                                    ) : (
                                        filteredQuestions.map((q) => (
                                            <div
                                                key={q.id}
                                                className={`group p-4 rounded-2xl border transition-all ${editingQuestion?.id === q.id
                                                    ? 'bg-amber-500/10 border-amber-500/50'
                                                    : 'bg-gray-800/30 border-gray-700/50 hover:bg-gray-800/50'
                                                    }`}
                                            >
                                                <div className="flex justify-between items-start gap-3">
                                                    <div className="flex-1 min-w-0">
                                                        {/* Tags */}
                                                        <div className="flex flex-wrap items-center gap-1.5 mb-2">
                                                            <span className="inline-block px-2 py-0.5 text-[10px] font-bold rounded bg-gradient-to-r from-gray-600 to-gray-700 text-white">
                                                                {subjectsList.find(s => s.id === q.subjectId)?.name || q.subjectId}
                                                            </span>
                                                            <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded border ${q.section === 'natural' ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10' :
                                                                q.section === 'social' ? 'border-amber-500/50 text-amber-400 bg-amber-500/10' :
                                                                    'border-blue-500/50 text-blue-400 bg-blue-500/10'
                                                                }`}>
                                                                {q.section?.toUpperCase()}
                                                            </span>
                                                            {q.year && (
                                                                <span className="inline-block px-2 py-0.5 text-[10px] font-bold rounded border border-purple-500/50 text-purple-400 bg-purple-500/10">
                                                                    {q.year}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {/* Question Preview */}
                                                        <RichTextContent
                                                            content={q.question}
                                                            className="text-gray-200 text-sm mb-2 rich-text-preview line-clamp-2"
                                                        />
                                                        {/* Answer */}
                                                        <div className="text-xs text-emerald-400 flex items-center gap-1">
                                                            <CheckCircle className="w-3 h-3" />
                                                            Answer: {['A', 'B', 'C', 'D'][q.correctAnswer]}
                                                        </div>
                                                    </div>
                                                    {/* Action Buttons */}
                                                    <div className="flex flex-col gap-1">
                                                        <button
                                                            onClick={() => handleEditQuestion(q)}
                                                            className="p-2 text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                                                            title="Edit Question"
                                                        >
                                                            <Edit3 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteQuestion(q.id)}
                                                            className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                            title="Delete Question"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    )}

                    {/* SUBJECTS TAB */}
                    {activeTab === 'subjects' && (
                        <div className="grid lg:grid-cols-2 gap-8">
                            {/* Add Subject Form */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="glass-card rounded-3xl p-8 overflow-hidden h-fit"
                            >
                                <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl" />

                                <h2 className="relative text-xl font-bold text-white mb-8 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                                        {editingSubjectId ? <FileText className="w-5 h-5 text-white" /> : <Plus className="w-5 h-5 text-white" />}
                                    </div>
                                    {editingSubjectId ? `Edit ${newSubjectName}` : 'Add New Subject'}
                                </h2>

                                <form onSubmit={handleAddSubject} className="relative space-y-6">
                                    {/* Name */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Subject Name</label>
                                        <input
                                            type="text"
                                            value={newSubjectName}
                                            onChange={(e) => setNewSubjectName(e.target.value)}
                                            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl focus:ring-2 focus:ring-emerald-500/50 text-white"
                                            placeholder="e.g. Economics"
                                        />
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                                        <textarea
                                            value={newSubjectDesc}
                                            onChange={(e) => setNewSubjectDesc(e.target.value)}
                                            rows={3}
                                            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl focus:ring-2 focus:ring-emerald-500/50 text-white resize-none"
                                            placeholder="Brief description..."
                                        />
                                    </div>

                                    {/* Duration */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Exam Duration (Minutes)</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                min="1"
                                                value={newSubjectDuration}
                                                onChange={(e) => setNewSubjectDuration(parseInt(e.target.value) || 60)}
                                                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl focus:ring-2 focus:ring-emerald-500/50 text-white pl-10"
                                                placeholder="60"
                                            />
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                                <div className="w-4 h-4 border-2 border-current rounded-full border-t-transparent animate-spin" style={{ animationDuration: '3s' }} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Icon Picker */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                                            <Star className="w-4 h-4" /> Choose Icon
                                        </label>
                                        <div className="grid grid-cols-7 gap-2">
                                            {[
                                                { id: 'math', icon: <Calculator className="w-4 h-4" /> },
                                                { id: 'physics', icon: <Atom className="w-4 h-4" /> },
                                                { id: 'chemistry', icon: <FlaskConical className="w-4 h-4" /> },
                                                { id: 'biology', icon: <Leaf className="w-4 h-4" /> },
                                                { id: 'english', icon: <BookOpen className="w-4 h-4" /> },
                                                { id: 'geography', icon: <Globe className="w-4 h-4" /> },
                                                { id: 'economics', icon: <Briefcase className="w-4 h-4" /> },
                                                { id: 'psychology', icon: <Brain className="w-4 h-4" /> },
                                                { id: 'art', icon: <PenTool className="w-4 h-4" /> },
                                                { id: 'music', icon: <Music className="w-4 h-4" /> },
                                                { id: 'coding', icon: <Code className="w-4 h-4" /> },
                                                { id: 'business', icon: <LineChart className="w-4 h-4" /> },
                                                { id: 'general', icon: <Star className="w-4 h-4" /> }
                                            ].map((item) => (
                                                <button
                                                    key={item.id}
                                                    type="button"
                                                    onClick={() => setNewSubjectIcon(item.id)}
                                                    className={`aspect-square rounded-xl flex items-center justify-center transition-all border ${newSubjectIcon === item.id
                                                        ? 'bg-blue-600 border-blue-500 text-white shadow-lg'
                                                        : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:bg-gray-800'
                                                        }`}
                                                    title={item.id}
                                                >
                                                    {item.icon}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Color Picker */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                                            <Palette className="w-4 h-4" /> Choose Theme Color
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {[
                                                'blue', 'purple', 'green', 'orange', 'red', 'pink', 'indigo', 'teal', 'amber'
                                            ].map((color) => (
                                                <button
                                                    key={color}
                                                    type="button"
                                                    onClick={() => setNewSubjectColor(color)}
                                                    className={`w-8 h-8 rounded-full border-2 transition-all ${newSubjectColor === color
                                                        ? 'border-white scale-110 shadow-lg shadow-white/20'
                                                        : 'border-transparent'
                                                        }`}
                                                    style={{
                                                        backgroundColor: {
                                                            blue: '#3b82f6',
                                                            purple: '#8b5cf6',
                                                            green: '#10b981',
                                                            orange: '#f59e0b',
                                                            red: '#ef4444',
                                                            pink: '#ec4899',
                                                            indigo: '#6366f1',
                                                            teal: '#14b8a6',
                                                            amber: '#f59e0b'
                                                        }[color]
                                                    }}
                                                    title={color}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Sections */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Available in Sections</label>
                                        <div className="flex flex-wrap gap-2">
                                            {['natural', 'social', 'freshman'].map((s) => (
                                                <button
                                                    key={s}
                                                    type="button"
                                                    onClick={() => {
                                                        if (newSubjectSections.includes(s)) {
                                                            setNewSubjectSections(newSubjectSections.filter(x => x !== s));
                                                        } else {
                                                            setNewSubjectSections([...newSubjectSections, s]);
                                                        }
                                                    }}
                                                    className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all ${newSubjectSections.includes(s)
                                                        ? 'bg-emerald-600 border-emerald-500 text-white'
                                                        : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:bg-gray-800'
                                                        }`}
                                                >
                                                    {s.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <button
                                            type="submit"
                                            disabled={savingSubject || newSubjectSections.length === 0}
                                            className="flex-1 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-emerald-500/25 transition-all disabled:opacity-50"
                                        >
                                            {savingSubject ? <Loader2 className="animate-spin w-5 h-5" /> : <><Save className="w-5 h-5" /> {editingSubjectId ? 'Update Subject' : 'Save Subject'}</>}
                                        </button>
                                        {editingSubjectId && (
                                            <button
                                                type="button"
                                                onClick={handleCancelSubjectEdit}
                                                className="px-6 py-4 bg-gray-800 text-gray-400 rounded-xl font-semibold hover:bg-gray-700 transition-all"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                </form>
                            </motion.div>

                            {/* Subjects List */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="glass-card rounded-3xl p-8 overflow-hidden h-fit"
                            >
                                <h2 className="relative text-xl font-bold text-white mb-6 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                                        <BookOpen className="w-5 h-5 text-white" />
                                    </div>
                                    Available Subjects
                                </h2>

                                <div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar">
                                    {subjectsList.map((s) => (
                                        <div key={s.id} className="p-4 bg-gray-800/30 rounded-2xl border border-gray-700/50 flex items-center justify-between group">
                                            <div>
                                                <h3 className="font-bold text-white mb-1">{s.name}</h3>
                                                <p className="text-sm text-gray-400 line-clamp-1">{s.description}</p>
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {s.sections?.map((sec: string) => (
                                                        <span key={sec} className="px-1.5 py-0.5 bg-gray-700 text-[10px] text-gray-300 rounded uppercase">
                                                            {sec}
                                                        </span>
                                                    ))}
                                                    <div className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded inline-block">
                                                        {s.questionCount || 0} Qs
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleEditSubject(s)}
                                                className="p-2 text-gray-400 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                <FileText className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </div>
                    )}

                    {/* USERS TAB */}
                    {activeTab === 'users' && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-card rounded-3xl p-8 overflow-hidden min-h-[600px]"
                        >
                            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                        <Users className="w-5 h-5 text-white" />
                                    </div>
                                    User Management
                                    <span className="ml-auto px-3 py-1 bg-blue-500/20 text-blue-300 text-sm rounded-lg">
                                        {usersList.length}
                                    </span>
                                </h2>
                                <div className="relative w-full md:w-72">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input
                                        type="text"
                                        placeholder="Search by name or email..."
                                        value={userSearch}
                                        onChange={(e) => setUserSearch(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 text-white text-sm"
                                    />
                                </div>
                            </div>

                            <div className="overflow-x-auto custom-scrollbar">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-gray-800 text-gray-400 text-sm uppercase tracking-wider">
                                            <th className="py-4 px-4 font-bold">User</th>
                                            <th className="py-4 px-4 font-bold">Joined</th>
                                            <th className="py-4 px-4 font-bold">Role</th>
                                            <th className="py-4 px-4 font-bold">Status</th>
                                            <th className="py-4 px-4 font-bold text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-800/50">
                                        {loadingUsers ? (
                                            <tr><td colSpan={5} className="py-10 text-center"><Loader2 className="animate-spin inline text-blue-500" /></td></tr>
                                        ) : filteredUsers.length === 0 ? (
                                            <tr><td colSpan={5} className="py-10 text-center text-gray-500">No users found.</td></tr>
                                        ) : (
                                            filteredUsers.map((u) => (
                                                <tr key={u.uid} className="hover:bg-white/5 transition-colors group">
                                                    <td className="py-4 px-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-sm ${u.role === 'admin' ? 'bg-gradient-to-br from-amber-500 to-orange-600' : 'bg-gradient-to-br from-blue-500 to-purple-600'}`}>
                                                                {u.name?.[0]?.toUpperCase() || 'U'}
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-white text-sm">{u.name || 'Anonymous'}</p>
                                                                <p className="text-xs text-gray-500">{u.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-4 text-sm text-gray-400">
                                                        {u.createdAt?.seconds ? new Date(u.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${u.role === 'admin' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'}`}>
                                                            {u.role === 'admin' && <Shield className="w-3 h-3" />}
                                                            {u.role}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${u.status === 'inactive' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'}`}>
                                                            {u.status === 'inactive' ? 'Inactive' : 'Active'}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                onClick={() => handleToggleRole(u.uid, u.role)}
                                                                className={`p-2 rounded-lg transition-all ${u.role === 'admin' ? 'text-amber-500 hover:bg-amber-500/10' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
                                                                title={u.role === 'admin' ? "Make Student" : "Make Admin"}
                                                            >
                                                                <ShieldOff className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleToggleStatus(u.uid, u.status || 'active')}
                                                                className={`p-2 rounded-lg transition-all ${u.status === 'inactive' ? 'text-emerald-500 hover:bg-emerald-500/10' : 'text-gray-400 hover:text-red-400 hover:bg-red-500/10'}`}
                                                                title={u.status === 'inactive' ? "Activate" : "Deactivate"}
                                                            >
                                                                {u.status === 'inactive' ? <CheckCircle className="w-4 h-4" /> : <ShieldOff className="w-4 h-4" />}
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteUser(u.uid)}
                                                                className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                                title="Delete Permanently"
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
                        </motion.div>
                    )}

                    {/* TEXTBOOKS TAB */}
                    {activeTab === 'textbooks' && (
                        <div className="grid lg:grid-cols-2 gap-8">
                            {/* Upload Form */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="glass-card rounded-3xl p-8 overflow-hidden h-fit"
                            >
                                <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl" />

                                <h2 className="relative text-xl font-bold text-white mb-8 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                        <Plus className="w-5 h-5 text-white" />
                                    </div>
                                    Upload Textbook
                                </h2>

                                <form onSubmit={handleUploadTextbook} className="relative space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Grade</label>
                                            <select
                                                value={textbookForm.grade}
                                                onChange={(e) => setTextbookForm(prev => ({ ...prev, grade: parseInt(e.target.value) }))}
                                                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 text-white"
                                            >
                                                {[...Array(12)].map((_, i) => (
                                                    <option key={i + 1} value={i + 1}>Grade {i + 1}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Stream</label>
                                            <select
                                                value={textbookForm.stream}
                                                onChange={(e) => setTextbookForm(prev => ({ ...prev, stream: e.target.value as any }))}
                                                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 text-white"
                                            >
                                                <option value="none">None (General)</option>
                                                <option value="natural">Natural</option>
                                                <option value="social">Social</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Subject</label>
                                        <select
                                            value={textbookForm.subjectId}
                                            onChange={(e) => setTextbookForm(prev => ({ ...prev, subjectId: e.target.value }))}
                                            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 text-white"
                                        >
                                            <option value="" disabled>Select Subject</option>
                                            {subjectsList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Student Book (PDF)</label>
                                            <div className="relative group">
                                                <input
                                                    type="file"
                                                    accept=".pdf"
                                                    onChange={(e) => setTextbookForm(prev => ({ ...prev, studentBookFile: e.target.files?.[0] || null }))}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                    disabled={uploadingTextbook}
                                                />
                                                <div className={`p-4 rounded-xl border-2 border-dashed transition-all flex flex-col items-center gap-2 ${textbookForm.studentBookFile ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-gray-700 hover:border-gray-600 bg-gray-800/20'}`}>
                                                    <FileText className={`w-6 h-6 ${textbookForm.studentBookFile ? 'text-emerald-400' : 'text-gray-500'}`} />
                                                    <span className="text-xs text-gray-400 text-center truncate w-full px-2">
                                                        {textbookForm.studentBookFile ? textbookForm.studentBookFile.name : 'Choose File'}
                                                    </span>

                                                    {/* Progress Bar */}
                                                    {uploadProgress['student-book'] !== undefined && (
                                                        <div className="w-full mt-2 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${uploadProgress['student-book']}%` }}
                                                                className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Teacher's Guide (PDF)</label>
                                            <div className="relative group">
                                                <input
                                                    type="file"
                                                    accept=".pdf"
                                                    onChange={(e) => setTextbookForm(prev => ({ ...prev, teacherGuideFile: e.target.files?.[0] || null }))}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                    disabled={uploadingTextbook}
                                                />
                                                <div className={`p-4 rounded-xl border-2 border-dashed transition-all flex flex-col items-center gap-2 ${textbookForm.teacherGuideFile ? 'border-amber-500/50 bg-amber-500/5' : 'border-gray-700 hover:border-gray-600 bg-gray-800/20'}`}>
                                                    <BookOpen className={`w-6 h-6 ${textbookForm.teacherGuideFile ? 'text-amber-400' : 'text-gray-500'}`} />
                                                    <span className="text-xs text-gray-400 text-center truncate w-full px-2">
                                                        {textbookForm.teacherGuideFile ? textbookForm.teacherGuideFile.name : 'Choose File'}
                                                    </span>

                                                    {/* Progress Bar */}
                                                    {uploadProgress['teachers-guide'] !== undefined && (
                                                        <div className="w-full mt-2 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${uploadProgress['teachers-guide']}%` }}
                                                                className="h-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={uploadingTextbook}
                                        className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-blue-500/20 transition-all disabled:opacity-50"
                                    >
                                        {uploadingTextbook ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Uploading...
                                            </>
                                        ) : (
                                            <>
                                                <Plus className="w-5 h-5" />
                                                Save Textbook
                                            </>
                                        )}
                                    </button>
                                </form>
                            </motion.div>

                            {/* Textbook List */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="glass-card rounded-3xl p-8 overflow-hidden h-fit"
                            >
                                <h2 className="relative text-xl font-bold text-white mb-6 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                        <BookOpen className="w-5 h-5 text-white" />
                                    </div>
                                    Managed Textbooks
                                </h2>

                                <div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar">
                                    {loadingTextbooks ? (
                                        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" /></div>
                                    ) : textbooks.length === 0 ? (
                                        <div className="text-center py-20 text-gray-500 italic">No textbooks uploaded yet.</div>
                                    ) : (
                                        textbooks.map((t) => (
                                            <div key={t.id} className="p-4 bg-gray-800/30 rounded-2xl border border-gray-700/50 flex items-center justify-between group hover:bg-gray-800/50 transition-all">
                                                <div>
                                                    <div className="flex items-center gap-1 mb-1 flex-wrap">
                                                        <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-[10px] font-black rounded uppercase">G-{t.grade}</span>
                                                        {t.stream !== 'none' && (
                                                            <span className={`px-2 py-0.5 text-[10px] font-black rounded uppercase ${t.stream === 'natural' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                                                {t.stream}
                                                            </span>
                                                        )}
                                                        <h3 className="font-bold text-white text-sm ml-1">{t.subjectName}</h3>
                                                    </div>
                                                    <div className="flex items-center gap-3 mt-2">
                                                        {t.studentBookUrl && <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-bold"><FileText className="w-3 h-3" /> Student Book</span>}
                                                        {t.teacherGuideUrl && <span className="text-[10px] text-amber-400 flex items-center gap-1 font-bold"><BookOpen className="w-3 h-3" /> Teacher Guide</span>}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteTextbook(t)}
                                                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    )}

                </div>
            </main>

            <AnimatePresence>
                {showCalculator && (
                    <MathCalculator
                        onInsert={handleInsertLaTeX}
                        onClose={() => setShowCalculator(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
