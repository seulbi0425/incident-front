import { useState, useEffect } from 'react';
import {
    ShieldCheck, User, Lock, Eye, EyeOff, AlertCircle, LogOut,
    Home, FilePlus2, ClipboardList, Calculator, History, RefreshCw,
    Trash2, Search, Package, AlertTriangle, CheckCircle2, Clock, X, Download,
    Check, Ban,
} from 'lucide-react';

const API = 'http://localhost:8080/api';

// 선택 옵션들 (백엔드 Incident: brand / orderNo / trackingNo / incidentType / status)
const BRANDS = ['MLB', 'DX', 'MK', 'DV', 'ST', 'W'];
const INCIDENT_TYPES = ['송장흐름없음', '분실', '파손', '오배송', '지연', '기타'];
const CARRIERS = ['로젠', 'CJ'];

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

// 사이드바 메뉴 (key = 화면 식별자, icon = lucide 아이콘)
const MENU = [
    { key: 'home', label: '홈', icon: Home },
    { key: 'create', label: '사고접수 등록', icon: FilePlus2 },
    { key: 'list', label: '사고접수 조회', icon: ClipboardList },
    { key: 'approval', label: '승인 대기', icon: Clock },
    { key: 'settlement', label: '정산 검증', icon: Calculator },
    { key: 'history', label: '시스템 변경 이력', icon: History },
];

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
    const [view, setView] = useState('home'); // MENU의 key 중 하나
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

    // 등록 성공 시 목록 갱신 후 조회 화면으로
    const handleCreated = (created) => {
        setIncidents(prev => [...prev, created]);
        setView('list');
    };

    // 승인/반려 등으로 단건이 갱신되면 목록에 반영
    const updateIncident = (updated) => {
        setIncidents(prev => prev.map(inc => (inc.id === updated.id ? updated : inc)));
    };

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* 좌측 세로 사이드바 */}
            <aside className="fixed inset-y-0 left-0 z-20 w-60 bg-white border-r border-slate-200 flex flex-col">
                {/* 로고 */}
                <div className="flex items-center gap-2 px-5 h-16 border-b border-slate-200">
                    <ShieldCheck size={20} className="text-slate-900" />
                    <span className="font-semibold text-slate-900 leading-tight">사고접수<br />통합 시스템</span>
                </div>

                {/* 메뉴 */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    {MENU.map(({ key, label, icon: Icon }) => (
                        <button
                            key={key}
                            onClick={() => setView(key)}
                            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm font-medium transition ${
                                view === key ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                            }`}
                        >
                            <Icon size={16} />
                            {label}
                        </button>
                    ))}
                </nav>

                {/* 사용자 정보 + 로그아웃 */}
                <div className="border-t border-slate-200 p-3">
                    <div className="px-2 py-1.5 mb-1">
                        <div className="text-sm font-medium text-slate-700">{user.name}님</div>
                        {user.role && <div className="text-[11px] text-slate-400">{ROLE_LABEL[user.role] ?? user.role}</div>}
                    </div>
                    <button onClick={onLogout} className="w-full flex items-center gap-2 text-xs text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md px-3 py-2 transition">
                        <LogOut size={14} />
                        로그아웃
                    </button>
                </div>
            </aside>

            {/* 본문 영역 (사이드바 너비만큼 좌측 여백) */}
            <div className="flex-1 ml-60 min-h-screen">
                <div className="max-w-6xl mx-auto p-6">
                    {view === 'list' && (
                        <Dashboard
                            incidents={incidents}
                            loading={loading}
                            error={error}
                            onReload={loadIncidents}
                            onDelete={deleteIncident}
                            onGoCreate={() => setView('create')}
                        />
                    )}
                    {view === 'create' && (
                        <CreateIncident onCreated={handleCreated} onCancel={() => setView('list')} />
                    )}
                    {view === 'home' && (
                        <HomeView incidents={incidents} user={user} />
                    )}
                    {view === 'approval' && (
                        <ApprovalQueue
                            incidents={incidents}
                            user={user}
                            loading={loading}
                            onUpdated={updateIncident}
                            onReload={loadIncidents}
                        />
                    )}
                    {view === 'settlement' && (
                        <Placeholder icon={Calculator} title="정산 검증" desc="승인된 사고건의 정산 금액을 검증하고 확정하는 화면입니다." />
                    )}
                    {view === 'history' && (
                        <Placeholder icon={History} title="시스템 변경 이력" desc="사고건 상태 변경 및 시스템 활동 로그를 확인하는 화면입니다." />
                    )}
                </div>
            </div>
        </div>
    );
}

// 사고건에서 접수일자 추정 (createdAt 류 → 없으면 주문번호의 YYYYMMDD 패턴)
function incidentDate(inc) {
    const raw = inc.createdAt ?? inc.createdDate ?? inc.regDate ?? inc.registeredAt;
    if (raw) {
        const d = new Date(raw);
        if (!isNaN(d.getTime())) return d;
    }
    const m = String(inc.orderNo ?? '').match(/(\d{4})(\d{2})(\d{2})/);
    if (m) {
        const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
        if (!isNaN(d.getTime())) return d;
    }
    return null;
}

// 브랜드별 막대 색상
const BRAND_BAR = {
    MLB: 'bg-slate-900', DX: 'bg-slate-700', MK: 'bg-slate-500',
    DV: 'bg-slate-400', ST: 'bg-amber-500', W: 'bg-blue-500',
};

// ============ 홈 ============
function HomeView({ incidents, user }) {
    const stats = [
        { label: '전체', count: incidents.length, icon: <Package size={18} />, color: 'text-slate-900' },
        { label: '접수대기', count: incidents.filter(i => i.status === 'pending').length, icon: <Clock size={18} />, color: 'text-amber-600' },
        { label: '로젠승인', count: incidents.filter(i => i.status === 'approved').length, icon: <CheckCircle2 size={18} />, color: 'text-blue-600' },
        { label: '정산완료', count: incidents.filter(i => i.status === 'settled').length, icon: <AlertTriangle size={18} />, color: 'text-emerald-600' },
    ];

    // 월별 접수 추이 (최근 6개월)
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: `${d.getMonth() + 1}월`, count: 0 });
    }
    incidents.forEach(inc => {
        const d = incidentDate(inc);
        if (!d) return;
        const bucket = months.find(m => m.key === `${d.getFullYear()}-${d.getMonth()}`);
        if (bucket) bucket.count++;
    });
    const maxMonth = Math.max(1, ...months.map(m => m.count));

    // 브랜드별 분포
    const brandData = BRANDS
        .map(b => ({ brand: b, count: incidents.filter(i => i.brand === b).length }))
        .sort((a, b) => b.count - a.count);
    const maxBrand = Math.max(1, ...brandData.map(b => b.count));

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-slate-900">{user.name}님, 안녕하세요 👋</h2>
                <p className="text-sm text-slate-500 mt-0.5">사고접수 통합 시스템 현황을 한눈에 확인하세요</p>
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

            {/* 차트 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* 월별 접수 추이 */}
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                    <h3 className="text-sm font-semibold text-slate-900">월별 접수 추이</h3>
                    <p className="text-xs text-slate-400 mt-0.5 mb-4">최근 6개월</p>
                    <div className="flex items-end justify-between gap-3 h-44">
                        {months.map(m => (
                            <div key={m.key} className="flex-1 flex flex-col items-center justify-end h-full">
                                <span className="text-xs font-medium text-slate-600 mb-1">{m.count}</span>
                                <div
                                    className="w-full max-w-[36px] bg-slate-900 rounded-t-md transition-all"
                                    style={{ height: `${(m.count / maxMonth) * 100}%`, minHeight: m.count > 0 ? '4px' : '0' }}
                                />
                                <span className="text-[11px] text-slate-400 mt-1.5">{m.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 브랜드별 분포 */}
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                    <h3 className="text-sm font-semibold text-slate-900">브랜드별 분포</h3>
                    <p className="text-xs text-slate-400 mt-0.5 mb-4">전체 {incidents.length}건 기준</p>
                    <div className="space-y-2.5">
                        {brandData.map(({ brand, count }) => (
                            <div key={brand} className="flex items-center gap-3">
                                <span className="w-10 text-xs font-medium text-slate-600 shrink-0">{brand}</span>
                                <div className="flex-1 bg-slate-100 rounded-full h-5 overflow-hidden">
                                    <div
                                        className={`${BRAND_BAR[brand] ?? 'bg-slate-500'} h-full rounded-full transition-all`}
                                        style={{ width: `${(count / maxBrand) * 100}%` }}
                                    />
                                </div>
                                <span className="w-8 text-right text-xs text-slate-500 shrink-0">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// 날짜시간 포맷 (YYYY-MM-DD HH:mm), 값 없으면 '-'
function fmtDateTime(v) {
    if (!v) return '-';
    const d = new Date(v);
    if (isNaN(d.getTime())) return v;
    const p = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

// ============ 승인 대기 ============
function ApprovalQueue({ incidents, user, loading, onUpdated, onReload }) {
    const [busyId, setBusyId] = useState(null); // 처리 중인 사고건 id
    const [error, setError] = useState('');

    const pending = incidents.filter(i => i.status === 'pending');

    // 승인: PUT /approve (현재 로그인 사용자를 승인자로)
    const approve = async (inc) => {
        setError('');
        setBusyId(inc.id);
        try {
            const res = await fetch(`${API}/incidents/${inc.id}/approve`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ approvedBy: user.loginId }),
            });
            if (!res.ok) throw new Error('서버 오류 (' + res.status + ')');
            onUpdated(await res.json());
        } catch (e) {
            setError('승인 실패: ' + e.message);
        } finally {
            setBusyId(null);
        }
    };

    // 반려: 사유 입력 후 PUT /reject
    const reject = async (inc) => {
        const reason = window.prompt(`#${inc.id} 반려 사유를 입력하세요`);
        if (reason === null) return; // 취소
        if (!reason.trim()) {
            setError('반려 사유를 입력해주세요');
            return;
        }
        setError('');
        setBusyId(inc.id);
        try {
            const res = await fetch(`${API}/incidents/${inc.id}/reject`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rejectedBy: user.loginId, rejectReason: reason.trim() }),
            });
            if (!res.ok) throw new Error('서버 오류 (' + res.status + ')');
            onUpdated(await res.json());
        } catch (e) {
            setError('반려 실패: ' + e.message);
        } finally {
            setBusyId(null);
        }
    };

    return (
        <div>
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h2 className="text-xl font-semibold text-slate-900">승인 대기</h2>
                    <p className="text-sm text-slate-500 mt-0.5">접수대기 상태의 사고건을 검토하고 승인·반려 처리하세요</p>
                </div>
                <button onClick={onReload} className="flex items-center gap-1.5 text-sm text-slate-600 border border-slate-200 rounded-md px-3 py-2 hover:bg-slate-50">
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                    새로고침
                </button>
            </div>

            {/* 대기 건수 */}
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3 mb-4">
                <Clock size={16} />
                <span className="text-sm font-medium">{pending.length}건이 승인을 기다리고 있습니다</span>
            </div>

            {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-3 rounded-md mb-4 flex items-center gap-2">
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}

            {/* 목록 */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-slate-50 text-slate-500 text-xs">
                            <th className="text-left font-medium px-4 py-3 w-16">번호</th>
                            <th className="text-left font-medium px-4 py-3">접수일시</th>
                            <th className="text-left font-medium px-4 py-3">브랜드</th>
                            <th className="text-left font-medium px-4 py-3">주문번호</th>
                            <th className="text-left font-medium px-4 py-3">송장번호</th>
                            <th className="text-left font-medium px-4 py-3">사고유형</th>
                            <th className="text-left font-medium px-4 py-3">등록자</th>
                            <th className="text-right font-medium px-4 py-3 w-44">처리</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pending.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="text-center text-slate-400 py-12 text-sm">
                                    {loading ? '불러오는 중...' : '승인 대기 중인 사고건이 없습니다.'}
                                </td>
                            </tr>
                        ) : (
                            pending.map(inc => (
                                <tr key={inc.id} className="border-t border-slate-100 hover:bg-slate-50">
                                    <td className="px-4 py-3 text-slate-400">#{inc.id}</td>
                                    <td className="px-4 py-3 text-slate-600 text-xs">{fmtDateTime(inc.createdAt ?? inc.registeredAt)}</td>
                                    <td className="px-4 py-3 font-medium text-slate-800">{inc.brand}</td>
                                    <td className="px-4 py-3 text-slate-600 font-mono text-xs">{inc.orderNo}</td>
                                    <td className="px-4 py-3 text-slate-600 font-mono text-xs">{inc.trackingNo}</td>
                                    <td className="px-4 py-3 text-slate-700">{inc.incidentType}</td>
                                    <td className="px-4 py-3 text-slate-600">{inc.createdBy ?? inc.registeredBy ?? inc.reporter ?? '-'}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => approve(inc)}
                                                disabled={busyId === inc.id}
                                                className="flex items-center gap-1 text-xs font-medium bg-emerald-600 text-white rounded-md px-3 py-1.5 hover:bg-emerald-700 disabled:opacity-50"
                                            >
                                                <Check size={14} />
                                                승인
                                            </button>
                                            <button
                                                onClick={() => reject(inc)}
                                                disabled={busyId === inc.id}
                                                className="flex items-center gap-1 text-xs font-medium text-rose-600 border border-rose-200 rounded-md px-3 py-1.5 hover:bg-rose-50 disabled:opacity-50"
                                            >
                                                <Ban size={14} />
                                                반려
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ============ 준비 중 화면 (정산 검증 / 시스템 변경 이력) ============
function Placeholder({ icon: Icon, title, desc }) {
    return (
        <div>
            <div className="mb-5">
                <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
                <p className="text-sm text-slate-500 mt-0.5">{desc}</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-16 flex flex-col items-center justify-center text-center">
                <span className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 mb-4">
                    <Icon size={26} />
                </span>
                <p className="text-sm font-medium text-slate-600">준비 중인 기능입니다</p>
                <p className="text-xs text-slate-400 mt-1">곧 제공될 예정입니다</p>
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

    // 현재 화면에 보이는(필터 적용된) 목록을 엑셀(.xlsx)로 다운로드
    // xlsx 라이브러리는 용량이 커서 버튼 클릭 시에만 동적으로 불러온다
    const handleExport = async () => {
        const XLSX = await import('xlsx');
        const rows = filtered.map(inc => ({
            '번호': inc.id,
            '브랜드': inc.brand,
            '시즌': inc.season,
            '스타일코드': inc.styleCode,
            '컬러': inc.color,
            '사이즈': inc.size,
            '수량': inc.quantity ?? 1,
            '금액': inc.amount ?? 0,
            '송장번호': inc.trackingNo,
            '사고유형': inc.incidentType,
            '상태': statusLabel(inc.status),
        }));
        const ws = XLSX.utils.json_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, '사고접수');
        const d = new Date();
        const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
        XLSX.writeFile(wb, `사고접수_${stamp}.xlsx`);
    };

    return (
        <div>
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h2 className="text-xl font-semibold text-slate-900">사고접수 조회</h2>
                    <p className="text-sm text-slate-500 mt-0.5">등록된 사고건을 한눈에 확인하세요</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={onReload} className="flex items-center gap-1.5 text-sm text-slate-600 border border-slate-200 rounded-md px-3 py-2 hover:bg-slate-50">
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                        새로고침
                    </button>
                    <button
                        onClick={handleExport}
                        disabled={filtered.length === 0}
                        className="flex items-center gap-1.5 text-sm text-slate-600 border border-slate-200 rounded-md px-3 py-2 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="현재 목록을 엑셀로 다운로드"
                    >
                        <Download size={14} />
                        엑셀 다운로드
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
                            <th className="text-left font-medium px-4 py-3">시즌</th>
                            <th className="text-left font-medium px-4 py-3">스타일코드</th>
                            <th className="text-left font-medium px-4 py-3">컬러</th>
                            <th className="text-left font-medium px-4 py-3">사이즈</th>
                            <th className="text-right font-medium px-4 py-3 w-16">수량</th>
                            <th className="text-right font-medium px-4 py-3 w-24">금액</th>
                            <th className="text-left font-medium px-4 py-3">송장번호</th>
                            <th className="text-left font-medium px-4 py-3">사고유형</th>
                            <th className="text-left font-medium px-4 py-3 w-24">상태</th>
                            <th className="text-right font-medium px-4 py-3 w-16"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={12} className="text-center text-slate-400 py-12 text-sm">
                                    {loading ? '불러오는 중...' : '표시할 사고건이 없습니다.'}
                                </td>
                            </tr>
                        ) : (
                            filtered.map(inc => (
                                <tr key={inc.id} className="border-t border-slate-100 hover:bg-slate-50">
                                    <td className="px-4 py-3 text-slate-400">#{inc.id}</td>
                                    <td className="px-4 py-3 font-medium text-slate-800">{inc.brand}</td>
                                    <td className="px-4 py-3 text-slate-700">{inc.season}</td>
                                    <td className="px-4 py-3 text-slate-600 font-mono text-xs">{inc.styleCode}</td>
                                    <td className="px-4 py-3 text-slate-700">{inc.color}</td>
                                    <td className="px-4 py-3 text-slate-700">{inc.size}</td>
                                    <td className="px-4 py-3 text-right text-slate-700">{inc.quantity ?? 1}</td>
                                    <td className="px-4 py-3 text-right text-slate-700">{(inc.amount ?? 0).toLocaleString()}</td>
                                    <td className="px-4 py-3 text-slate-600 font-mono text-xs">{inc.trackingNo}</td>
                                    <td className="px-4 py-3 text-slate-700">{inc.incidentType}</td>
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
        incidentDate: '',
        carrier: CARRIERS[0],
        season: '',
        styleCode: '',
        color: '',
        size: '',
        quantity: 1,
        amount: 0,
        memo: '',
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
        if (!form.incidentDate) {
            setError('사고발생일을 입력해주세요');
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
                    <div>
                        <label className={labelCls}>사고발생일 <span className="text-rose-500">*</span></label>
                        <input
                            type="date"
                            value={form.incidentDate}
                            onChange={e => update('incidentDate', e.target.value)}
                            className={field}
                        />
                    </div>
                    <div>
                        <label className={labelCls}>택배사</label>
                        <select value={form.carrier} onChange={e => update('carrier', e.target.value)} className={field}>
                            {CARRIERS.map(c => <option key={c}>{c}</option>)}
                        </select>
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
                        <label className={labelCls}>시즌</label>
                        <input
                            value={form.season}
                            onChange={e => update('season', e.target.value)}
                            placeholder="예: 26SS"
                            className={field}
                        />
                    </div>
                    <div>
                        <label className={labelCls}>스타일코드</label>
                        <input
                            value={form.styleCode}
                            onChange={e => update('styleCode', e.target.value)}
                            placeholder="예: 3ATSM0234"
                            className={`${field} font-mono`}
                        />
                    </div>
                    <div>
                        <label className={labelCls}>컬러</label>
                        <input
                            value={form.color}
                            onChange={e => update('color', e.target.value)}
                            placeholder="예: 블랙"
                            className={field}
                        />
                    </div>
                    <div>
                        <label className={labelCls}>사이즈</label>
                        <input
                            value={form.size}
                            onChange={e => update('size', e.target.value)}
                            placeholder="예: 095 / M"
                            className={field}
                        />
                    </div>
                    <div>
                        <label className={labelCls}>수량</label>
                        <input
                            type="number"
                            min={1}
                            value={form.quantity}
                            onChange={e => update('quantity', Math.max(1, Number(e.target.value) || 1))}
                            className={field}
                        />
                    </div>
                    <div>
                        <label className={labelCls}>금액</label>
                        <input
                            type="number"
                            min={0}
                            value={form.amount}
                            onChange={e => update('amount', Math.max(0, Number(e.target.value) || 0))}
                            placeholder="0"
                            className={field}
                        />
                    </div>
                </div>

                <div>
                    <label className={labelCls}>메모</label>
                    <textarea
                        value={form.memo}
                        onChange={e => update('memo', e.target.value)}
                        rows={4}
                        placeholder="사고 상황·특이사항을 자유롭게 입력하세요"
                        className={`${field} resize-y`}
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
