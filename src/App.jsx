import { useState, useEffect } from 'react';
import {
    ShieldCheck, User, Lock, Eye, EyeOff, AlertCircle, LogOut,
    LayoutDashboard, FilePlus2, RefreshCw, Trash2, Search,
    Package, AlertTriangle, CheckCircle2, Clock, X,
} from 'lucide-react';

const API = 'http://localhost:8080/api';

// 선택 옵션들 (백엔드 Incident: brand / orderNo / trackingNo / incidentType / status)
const BRANDS = ['MLB', 'DX', 'MK', 'DV', 'ST', 'W'];
const INCIDENT_TYPES = ['송장흐름없음', '분실', '파손', '오배송', '지연', '기타'];

// 상태: 코드(value, DB 저장값) + 화면 표시명(label)
const STATUSES = [
    { value: 'pending', label: '접수대기' },
    { value: 'approved', label: '로젠승인' },
    { value: 'rejected', label: '반려' },
    { value: 'settled', label: '정산완료' },
    { value: 'withdrawn', label: '철회' },
];
const statusLabel = (v) => STATUSES.find(s => s.value === v)?.label ?? v ?? '미지정';

// 상태별 배지 색상 (코드 기준)
const STATUS_STYLE = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    approved: 'bg-blue-50 text-blue-700 border-blue-200',
    rejected: 'bg-rose-50 text-rose-700 border-rose-200',
    settled: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    withdrawn: 'bg-slate-100 text-slate-600 border-slate-200',
};

// 권한 코드 → 설명
const ROLE_LABEL = {
    admin: 'ERP팀/본사 관리자',
    metam: '메타엠 접수자',
    logen: '로젠 검토자',
};

function App() {
    const [currentUser, setCurrentUser] = useState(null); // 로그인한 사용자 기억

    // 로그인 안 했으면 로그인 화면, 했으면 메인 화면
    if (!currentUser) {
        return <LoginPage onLogin={setCurrentUser} />;
    }
    return <MainPage user={currentUser} onLogout={() => setCurrentUser(null)} />;
}

// ============ 로그인 화면 ============
function LoginPage({ onLogin }) {
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const [showPwd, setShowPwd] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async () => {
        setError('');
        if (!userId.trim() || !password.trim()) {
            setError('아이디와 비밀번호를 입력해주세요');
            return;
        }
        try {
            const response = await fetch(`${API}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ loginId: userId, password }),
            });
            const result = await response.text();
            if (result.startsWith('성공')) {
                // "성공: 홍길동님 환영합니다 (권한: admin)" 에서 이름/권한 뽑아내기
                const name = result.match(/성공:\s*(.+?)님/)?.[1] ?? userId;
                const role = result.match(/권한:\s*(.+?)\)/)?.[1] ?? '';
                onLogin({ loginId: userId, name, role, message: result });
            } else {
                setError(result.replace('실패: ', ''));
            }
        } catch (e) {
            setError('연결 실패: ' + e.message);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-slate-900 rounded-2xl mb-4">
                        <ShieldCheck size={28} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-semibold text-slate-900">사고접수 통합 시스템</h1>
                    <p className="text-sm text-slate-500 mt-1">F&F · 메타엠 · 로젠</p>
                </div>

                <div className="space-y-3">
                    <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1.5">아이디</label>
                        <div className="relative">
                            <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={userId}
                                onChange={e => setUserId(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                                placeholder="아이디를 입력하세요"
                                className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:border-slate-400"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1.5">비밀번호</label>
                        <div className="relative">
                            <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type={showPwd ? "text" : "password"}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                                placeholder="비밀번호를 입력하세요"
                                className="w-full pl-9 pr-10 py-2.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:border-slate-400"
                            />
                            <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs px-3 py-2 rounded-md flex items-center gap-2">
                            <AlertCircle size={14} />
                            {error}
                        </div>
                    )}

                    <button onClick={handleLogin} className="w-full py-2.5 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800 transition mt-4">
                        로그인
                    </button>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-100">
                    <div className="text-[10px] text-slate-400 text-center mb-2">테스트 계정</div>
                    <div className="text-[10px] text-slate-500 space-y-0.5 font-mono bg-slate-50 rounded-md p-2">
                        <div>마스터(본사): master / master1234</div>
                        <div>메타엠: metam / metam1234</div>
                        <div>로젠: logen / logen1234</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ============ 메인 화면 (로그인 후) ============
function MainPage({ user, onLogout }) {
    const [view, setView] = useState('dashboard'); // 'dashboard' | 'create'
    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const loadIncidents = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`${API}/incidents`);
            const data = await response.json();
            setIncidents(data);
        } catch (e) {
            setError('목록을 불러오지 못했습니다: ' + e.message);
        } finally {
            setLoading(false);
        }
    };

    // 로그인 직후 자동으로 목록 한 번 불러오기
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadIncidents();
    }, []);

    const deleteIncident = async (id) => {
        if (!confirm(`#${id} 사고건을 삭제할까요?`)) return;
        try {
            await fetch(`${API}/incidents/${id}`, { method: 'DELETE' });
            setIncidents(prev => prev.filter(inc => inc.id !== id));
        } catch (e) {
            alert('삭제 실패: ' + e.message);
        }
    };

    // 등록 성공 시 목록 갱신 후 대시보드로
    const handleCreated = (created) => {
        setIncidents(prev => [...prev, created]);
        setView('dashboard');
    };

    const navBtn = (key, icon, label) => (
        <button
            onClick={() => setView(key)}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition ${
                view === key ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
        >
            {icon}
            {label}
        </button>
    );

    return (
        <div className="min-h-screen bg-slate-50">
            {/* 상단 바 */}
            <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-2">
                    <ShieldCheck size={20} className="text-slate-900" />
                    <span className="font-semibold text-slate-900">사고접수 통합 시스템</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-600">
                        {user.name}님
                        {user.role && <span className="ml-1.5 text-[11px] text-slate-400">({ROLE_LABEL[user.role] ?? user.role})</span>}
                    </span>
                    <button onClick={onLogout} className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 border border-slate-200 rounded-md px-2.5 py-1.5">
                        <LogOut size={12} />
                        로그아웃
                    </button>
                </div>
            </div>

            {/* 네비게이션 */}
            <div className="bg-white border-b border-slate-200 px-6 py-2 flex items-center gap-2">
                {navBtn('dashboard', <LayoutDashboard size={15} />, '대시보드')}
                {navBtn('create', <FilePlus2 size={15} />, '사고건 등록')}
            </div>

            {/* 본문 */}
            <div className="max-w-6xl mx-auto p-6">
                {view === 'dashboard' ? (
                    <Dashboard
                        incidents={incidents}
                        loading={loading}
                        error={error}
                        onReload={loadIncidents}
                        onDelete={deleteIncident}
                        onGoCreate={() => setView('create')}
                    />
                ) : (
                    <CreateIncident onCreated={handleCreated} onCancel={() => setView('dashboard')} />
                )}
            </div>
        </div>
    );
}

// ============ 대시보드 ============
function Dashboard({ incidents, loading, error, onReload, onDelete, onGoCreate }) {
    const [statusFilter, setStatusFilter] = useState('전체');
    const [brandFilter, setBrandFilter] = useState('전체');
    const [keyword, setKeyword] = useState('');

    // 통계: 전체 / 접수대기 / 로젠승인 / 정산완료
    const stats = [
        { label: '전체', count: incidents.length, icon: <Package size={18} />, color: 'text-slate-900' },
        { label: '접수대기', count: incidents.filter(i => i.status === 'pending').length, icon: <Clock size={18} />, color: 'text-amber-600' },
        { label: '로젠승인', count: incidents.filter(i => i.status === 'approved').length, icon: <CheckCircle2 size={18} />, color: 'text-blue-600' },
        { label: '정산완료', count: incidents.filter(i => i.status === 'settled').length, icon: <AlertTriangle size={18} />, color: 'text-emerald-600' },
    ];

    const filtered = incidents.filter(inc => {
        if (statusFilter !== '전체' && inc.status !== statusFilter) return false;
        if (brandFilter !== '전체' && inc.brand !== brandFilter) return false;
        if (keyword.trim()) {
            const k = keyword.trim().toLowerCase();
            const hay = `${inc.orderNo ?? ''} ${inc.trackingNo ?? ''} ${inc.incidentType ?? ''}`.toLowerCase();
            if (!hay.includes(k)) return false;
        }
        return true;
    });

    return (
        <div>
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h2 className="text-xl font-semibold text-slate-900">사고접수 대시보드</h2>
                    <p className="text-sm text-slate-500 mt-0.5">등록된 사고건을 한눈에 확인하세요</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={onReload} className="flex items-center gap-1.5 text-sm text-slate-600 border border-slate-200 rounded-md px-3 py-2 hover:bg-slate-50">
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                        새로고침
                    </button>
                    <button onClick={onGoCreate} className="flex items-center gap-1.5 text-sm bg-slate-900 text-white rounded-md px-3 py-2 hover:bg-slate-800">
                        <FilePlus2 size={14} />
                        사고건 등록
                    </button>
                </div>
            </div>

            {/* 통계 카드 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {stats.map(s => (
                    <div key={s.label} className="bg-white border border-slate-200 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-500">{s.label}</span>
                            <span className={s.color}>{s.icon}</span>
                        </div>
                        <div className={`text-2xl font-semibold mt-2 ${s.color}`}>{s.count}</div>
                    </div>
                ))}
            </div>

            {/* 필터 */}
            <div className="bg-white border border-slate-200 rounded-xl p-3 mb-4 flex flex-wrap items-center gap-2">
                <div className="relative flex-1 min-w-[200px]">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        value={keyword}
                        onChange={e => setKeyword(e.target.value)}
                        placeholder="주문번호 · 송장번호 · 사고유형 검색"
                        className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:border-slate-400"
                    />
                </div>
                <select value={brandFilter} onChange={e => setBrandFilter(e.target.value)} className="text-sm border border-slate-200 rounded-md px-3 py-2 focus:outline-none focus:border-slate-400">
                    <option>전체</option>
                    {BRANDS.map(b => <option key={b}>{b}</option>)}
                </select>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="text-sm border border-slate-200 rounded-md px-3 py-2 focus:outline-none focus:border-slate-400">
                    <option value="전체">전체</option>
                    {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
            </div>

            {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-3 rounded-md mb-4 flex items-center gap-2">
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}

            {/* 목록 테이블 */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-slate-50 text-slate-500 text-xs">
                            <th className="text-left font-medium px-4 py-3 w-16">번호</th>
                            <th className="text-left font-medium px-4 py-3">브랜드</th>
                            <th className="text-left font-medium px-4 py-3">사고유형</th>
                            <th className="text-left font-medium px-4 py-3">주문번호</th>
                            <th className="text-left font-medium px-4 py-3">송장번호</th>
                            <th className="text-left font-medium px-4 py-3 w-24">상태</th>
                            <th className="text-right font-medium px-4 py-3 w-16"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="text-center text-slate-400 py-12 text-sm">
                                    {loading ? '불러오는 중...' : '표시할 사고건이 없습니다.'}
                                </td>
                            </tr>
                        ) : (
                            filtered.map(inc => (
                                <tr key={inc.id} className="border-t border-slate-100 hover:bg-slate-50">
                                    <td className="px-4 py-3 text-slate-400">#{inc.id}</td>
                                    <td className="px-4 py-3 font-medium text-slate-800">{inc.brand}</td>
                                    <td className="px-4 py-3 text-slate-700">{inc.incidentType}</td>
                                    <td className="px-4 py-3 text-slate-600 font-mono text-xs">{inc.orderNo}</td>
                                    <td className="px-4 py-3 text-slate-600 font-mono text-xs">{inc.trackingNo}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-block text-xs px-2 py-0.5 rounded-full border ${STATUS_STYLE[inc.status] ?? 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                                            {statusLabel(inc.status)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button onClick={() => onDelete(inc.id)} className="text-slate-400 hover:text-rose-600 p-1" title="삭제">
                                            <Trash2 size={15} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <p className="text-xs text-slate-400 mt-3">총 {filtered.length}건 표시 (전체 {incidents.length}건)</p>
        </div>
    );
}

// ============ 사고건 등록 ============
function CreateIncident({ onCreated, onCancel }) {
    const [form, setForm] = useState({
        brand: BRANDS[0],
        incidentType: INCIDENT_TYPES[0],
        orderNo: '',
        trackingNo: '',
        status: STATUSES[0].value,
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

    const handleSubmit = async () => {
        setError('');
        if (!form.orderNo.trim()) {
            setError('주문번호를 입력해주세요');
            return;
        }
        setSubmitting(true);
        try {
            const response = await fetch(`${API}/incidents`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            if (!response.ok) throw new Error('서버 오류 (' + response.status + ')');
            const created = await response.json();
            onCreated(created);
        } catch (e) {
            setError('등록 실패: ' + e.message);
        } finally {
            setSubmitting(false);
        }
    };

    const field = 'w-full px-3 py-2.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:border-slate-400';
    const labelCls = 'block text-xs font-medium text-slate-700 mb-1.5';

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h2 className="text-xl font-semibold text-slate-900">사고건 등록</h2>
                    <p className="text-sm text-slate-500 mt-0.5">새로운 사고건 정보를 입력하세요</p>
                </div>
                <button onClick={onCancel} className="text-slate-400 hover:text-slate-700 p-1">
                    <X size={20} />
                </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className={labelCls}>브랜드</label>
                        <select value={form.brand} onChange={e => update('brand', e.target.value)} className={field}>
                            {BRANDS.map(b => <option key={b}>{b}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className={labelCls}>사고유형</label>
                        <select value={form.incidentType} onChange={e => update('incidentType', e.target.value)} className={field}>
                            {INCIDENT_TYPES.map(t => <option key={t}>{t}</option>)}
                        </select>
                    </div>
                </div>

                <div>
                    <label className={labelCls}>주문번호 <span className="text-rose-500">*</span></label>
                    <input
                        value={form.orderNo}
                        onChange={e => update('orderNo', e.target.value)}
                        placeholder="예: ORD-20260605-001"
                        className={`${field} font-mono`}
                    />
                </div>

                <div>
                    <label className={labelCls}>송장번호</label>
                    <input
                        value={form.trackingNo}
                        onChange={e => update('trackingNo', e.target.value)}
                        placeholder="예: 1234567890"
                        className={`${field} font-mono`}
                    />
                </div>

                <div>
                    <label className={labelCls}>처리상태</label>
                    <div className="flex flex-wrap gap-2">
                        {STATUSES.map(s => (
                            <button
                                key={s.value}
                                type="button"
                                onClick={() => update('status', s.value)}
                                className={`text-sm px-3 py-1.5 rounded-md border transition ${
                                    form.status === s.value
                                        ? (STATUS_STYLE[s.value] ?? 'bg-slate-900 text-white border-slate-900') + ' font-medium'
                                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                }`}
                            >
                                {s.label}
                            </button>
                        ))}
                    </div>
                </div>

                {error && (
                    <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm px-3 py-2 rounded-md flex items-center gap-2">
                        <AlertCircle size={15} />
                        {error}
                    </div>
                )}

                <div className="flex items-center gap-2 pt-2">
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="flex-1 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800 transition disabled:opacity-50"
                    >
                        {submitting ? '등록 중...' : '사고건 등록'}
                    </button>
                    <button onClick={onCancel} className="px-5 py-2.5 text-sm text-slate-600 border border-slate-200 rounded-md hover:bg-slate-50">
                        취소
                    </button>
                </div>
            </div>
        </div>
    );
}

export default App;
