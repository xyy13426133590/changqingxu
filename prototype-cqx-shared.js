(function () {
    'use strict';

    var CHAT_STORAGE_KEY = 'cqx_chat_store_v1';

    var USERS_BY_ID = {
        u1: { name: '林溪', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160&h=160&fit=crop', hero: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=500&fit=crop' },
        u2: { name: '苏晴', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=160&h=160&fit=crop', hero: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=500&fit=crop' },
        u3: { name: '陈默', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&h=160&fit=crop', hero: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop' },
        u4: { name: '王悦', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&h=160&fit=crop', hero: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=500&fit=crop' },
        u5: { name: '周然', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=160&h=160&fit=crop', hero: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=500&fit=crop' },
        u6: { name: '若凡', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&h=160&fit=crop', hero: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=500&fit=crop' },
        u7: { name: '许诺', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=160&h=160&fit=crop', hero: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=500&fit=crop' },
        u8: { name: '唐诗', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=160&h=160&fit=crop', hero: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=500&fit=crop' },
        u9: { name: '程远', avatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=160&h=160&fit=crop', hero: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=500&fit=crop' },
        u10: { name: '陆川', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=160&h=160&fit=crop', hero: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=500&fit=crop' },
        u11: { name: '安然', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=160&h=160&fit=crop', hero: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=500&fit=crop' },
        u12: { name: '叶舟', avatar: 'https://images.unsplash.com/photo-1507594347049-ef73ba806cba?w=160&h=160&fit=crop', hero: 'https://images.unsplash.com/photo-1507594347049-ef73ba806cba?w=400&h=500&fit=crop' },
        u13: { name: '方简', avatar: 'https://images.unsplash.com/photo-1539578706168-07759dc111f1?w=160&h=160&fit=crop', hero: 'https://images.unsplash.com/photo-1539578706168-07759dc111f1?w=400&h=500&fit=crop' },
        u14: { name: '江澄', avatar: 'https://images.unsplash.com/photo-1522556189639-b150ed9fc433?w=160&h=160&fit=crop', hero: 'https://images.unsplash.com/photo-1522556189639-b150ed9fc433?w=400&h=500&fit=crop' }
    };

    function createDefaultChatStore() {
        return {
            u1: { id: 'u1', name: '林溪', avatar: USERS_BY_ID.u1.avatar, time: '10:21', preview: '周末要不要一起看展？', messages: [{ from: 'them', text: '你好呀，看了你的资料很投缘～' }, { from: 'me', text: '谢谢，我也觉得～' }, { from: 'them', text: '周末要不要一起看展？' }] },
            u2: { id: 'u2', name: '苏晴', avatar: USERS_BY_ID.u2.avatar, time: '昨天', preview: '好的，回见', messages: [{ from: 'them', text: '最近在学烘焙 🍰' }, { from: 'me', text: '太厉害了' }, { from: 'them', text: '好的，回见' }] },
            u3: { id: 'u3', name: '陈默', avatar: USERS_BY_ID.u3.avatar, time: '周一', preview: 'ok', messages: [{ from: 'them', text: '你好' }, { from: 'me', text: '你好' }, { from: 'them', text: 'ok' }] },
            u4: { id: 'u4', name: '王悦', avatar: USERS_BY_ID.u4.avatar, time: '12/20', preview: '系统提示：已互赞', messages: [{ from: 'them', text: '系统提示：已互赞' }] },
            u5: { id: 'u5', name: '周然', avatar: USERS_BY_ID.u5.avatar, time: '12/18', preview: '早点休息', messages: [{ from: 'them', text: '早点休息' }, { from: 'me', text: '嗯嗯你也是' }] }
        };
    }

    function loadChatStore() {
        try {
            var raw = sessionStorage.getItem(CHAT_STORAGE_KEY);
            if (!raw) return null;
            var o = JSON.parse(raw);
            if (o && typeof o === 'object' && Object.keys(o).length) return o;
        } catch (e) {}
        return null;
    }

    function saveChatStore() {
        try {
            sessionStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(CHAT_STORE));
        } catch (e) {}
    }

    var CHAT_STORE = createDefaultChatStore();
    var activeChatId = null;
    var currentDetailUserId = 'u1';

    var THIRD_PARTY_RULES = [
        { re: /微信|威信|薇信|加\s*v\s*信|加\s*微|微\s*信\s*号|\bvx\b|\bwx\b/i, tip: '内容可能引导添加微信等站外联系方式' },
        { re: /\bqq\b|扣扣|企鹅号|q\s*号|加\s*q/i, tip: '内容可能涉及 QQ 等第三方社交工具' },
        { re: /支付宝|转账|汇款|红包|收款码|付款码|银行卡|卡号|闲鱼|淘宝|抖音|小红书|快手|微博|telegram|tg\b|discord/i, tip: '内容可能涉及资金或第三方平台交易' },
        { re: /扫码|二维码|外链|站外|第三方|第三方平台|下载\s*app|\.(com|cn|net)\b|https?:\/\/|www\./i, tip: '内容可能引导跳转站外链接或第三方应用' },
        { re: /手机号|电话号|联系我\s*1[3-9]\d{9}|加\s*我\s*电话/i, tip: '内容可能引导交换电话等隐私联系方式' }
    ];

    function detectThirdPartyRisk(text) {
        if (!text || !String(text).trim()) return null;
        for (var i = 0; i < THIRD_PARTY_RULES.length; i++) {
            if (THIRD_PARTY_RULES[i].re.test(text)) return THIRD_PARTY_RULES[i].tip;
        }
        return null;
    }

    function escapeHtml(s) {
        return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function todayKey() {
        var d = new Date();
        return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    }

    function hashString(s) {
        var h = 0;
        for (var i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
        return Math.abs(h);
    }

    function getDailyTenUsers() {
        var key = 'cqx_daily_reco_v1_' + todayKey();
        try {
            var raw = localStorage.getItem(key);
            if (raw) {
                var ids = JSON.parse(raw);
                var list = ids.map(function (id) {
                    var u = USERS_BY_ID[id];
                    return u ? Object.assign({}, u, { id: id }) : null;
                }).filter(Boolean);
                if (list.length === 10) return list;
            }
        } catch (e) {}
        var allIds = Object.keys(USERS_BY_ID);
        var seed = hashString(key);
        var arr = allIds.slice();
        for (var i = arr.length - 1; i > 0; i--) {
            var j = (seed + i * 31) % (i + 1);
            var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
        }
        var ten = arr.slice(0, 10);
        try { localStorage.setItem(key, JSON.stringify(ten)); } catch (e2) {}
        return ten.map(function (id) {
            return Object.assign({}, USERS_BY_ID[id], { id: id });
        });
    }

    function renderDailyReco() {
        var strip = document.getElementById('daily-reco-strip');
        if (!strip) return;
        var users = getDailyTenUsers();
        strip.innerHTML = users.map(function (u) {
            return '<button type="button" class="flex flex-col items-center gap-1 shrink-0 w-14 group daily-reco-btn btn-press" data-uid="' + u.id + '">' +
                '<span class="w-12 h-12 rounded-full overflow-hidden ring-2 ring-purple-200 group-hover:ring-purple-400 transition-all anim-avatar">' +
                '<img src="' + u.avatar + '" class="w-full h-full object-cover" alt=""></span>' +
                '<span class="text-[10px] text-gray-600 truncate w-full text-center">' + escapeHtml(u.name) + '</span></button>';
        }).join('');
        strip.querySelectorAll('.daily-reco-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                showDailyProfile(btn.getAttribute('data-uid'));
            });
        });
    }

    function showDailyProfile(userId) {
        var u = USERS_BY_ID[userId];
        if (!u) return;
        currentDetailUserId = userId;
        var na = document.getElementById('detail-name');
        var av = document.getElementById('detail-avatar');
        var he = document.getElementById('detail-hero');
        if (na) na.textContent = u.name;
        if (av) av.src = u.avatar;
        if (he) he.src = u.hero || u.avatar;
        showPage('page-detail');
    }

    function ensureThread(userId) {
        if (CHAT_STORE[userId]) return CHAT_STORE[userId];
        var u = USERS_BY_ID[userId];
        if (!u) return null;
        CHAT_STORE[userId] = {
            id: userId,
            name: u.name,
            avatar: u.avatar,
            time: '刚刚',
            preview: '开始聊天吧',
            messages: [{ from: 'them', text: '你好呀～很高兴认识你' }]
        };
        saveChatStore();
        return CHAT_STORE[userId];
    }

    function renderMessagesList() {
        var el = document.getElementById('messages-thread-list');
        if (!el) return;
        var rows = Object.keys(CHAT_STORE).map(function (k) { return CHAT_STORE[k]; });
        el.innerHTML = rows.map(function (t) {
            return '<button type="button" class="w-full glass rounded-2xl p-3 flex items-center gap-3 text-left btn-press anim-card mb-2" data-open-chat="' + t.id + '">' +
                '<img src="' + t.avatar + '" class="w-12 h-12 rounded-full object-cover anim-avatar shrink-0" alt="">' +
                '<div class="flex-1 min-w-0"><div class="flex justify-between items-baseline gap-2">' +
                '<span class="font-medium text-gray-800">' + escapeHtml(t.name) + '</span>' +
                '<span class="text-xs text-gray-400 shrink-0">' + escapeHtml(t.time) + '</span></div>' +
                '<p class="text-sm text-gray-500 truncate">' + escapeHtml(t.preview) + '</p></div></button>';
        }).join('');
        el.querySelectorAll('[data-open-chat]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                openChat(btn.getAttribute('data-open-chat'));
            });
        });
    }

    function renderChatMessages() {
        var sc = document.getElementById('chat-messages-scroll');
        if (!sc || !activeChatId || !CHAT_STORE[activeChatId]) return;
        var t = CHAT_STORE[activeChatId];
        sc.innerHTML = t.messages.map(function (m) {
            var isMe = m.from === 'me';
            var bubble = isMe ? 'chat-bubble-me ml-auto max-w-[85%]' : 'chat-bubble-them mr-auto max-w-[85%]';
            var row = isMe ? 'flex justify-end' : 'flex justify-start';
            return '<div class="' + row + '"><div class="px-3 py-2 text-sm shadow-sm ' + bubble + '">' + escapeHtml(m.text) + '</div></div>';
        }).join('');
        sc.scrollTop = sc.scrollHeight;
    }

    function updateTabbar(pageId) {
        var tab = document.getElementById('app-tabbar');
        if (!tab) return;
        var hide = pageId === 'page-chat' || pageId === 'page-profile-edit' ||
            pageId === 'page-vip' || pageId === 'page-my-card' ||
            pageId === 'page-vip-popup' || pageId === 'page-greeting-limit' ||
            pageId === 'page-report';
        tab.classList.toggle('hidden', hide);
    }

    function openReportFlow(from) {
        try { sessionStorage.setItem('cqx_report_from', from || 'home'); } catch (e) {}
        showPage('page-report');
    }

    function dismissReport() {
        var from = 'home';
        try {
            from = sessionStorage.getItem('cqx_report_from') || 'home';
            sessionStorage.removeItem('cqx_report_from');
        } catch (e) {}
        if (from === 'detail') showPage('page-detail');
        else showPage('page-home');
    }

    function submitReport() {
        alert('举报已提交，我们会尽快处理');
        dismissReport();
    }

    function showVIPPopup() {
        if (document.getElementById('page-vip-popup')) showPage('page-vip-popup');
        else window.location.href = 'prototype-mine.html#vip';
    }

    function showGreetingLimit() {
        if (document.getElementById('page-greeting-limit')) showPage('page-greeting-limit');
        else alert('今日打招呼次数已用完（普通会员每日限 3 次），开通 VIP 可无限打招呼。');
    }

    function showPage(pageId) {
        document.querySelectorAll('.page').forEach(function (page) { page.classList.remove('active'); });
        var el = document.getElementById(pageId);
        if (!el) {
            if (pageId === 'page-filter') { window.location.href = 'prototype-filter.html'; return; }
            if (pageId === 'page-messages') { window.location.href = 'prototype-messages.html'; return; }
            if (pageId === 'page-chat') { window.location.href = 'prototype-messages.html'; return; }
            if (pageId === 'page-profile' || pageId === 'page-profile-edit') { window.location.href = 'prototype-mine.html'; return; }
            if (pageId === 'page-home' || pageId === 'page-detail' || pageId === 'page-report' || pageId === 'page-vip-popup' || pageId === 'page-greeting-limit') { window.location.href = 'prototype-discover.html'; return; }
            if (pageId === 'page-vip' || pageId === 'page-my-card') { window.location.href = 'prototype-mine.html' + (pageId === 'page-vip' ? '#vip' : '#card'); return; }
            return;
        }
        el.classList.add('active');
        updateTabbar(pageId);
        if (pageId === 'page-home') renderDailyReco();
        if (pageId === 'page-messages') renderMessagesList();
        if (pageId === 'page-chat') {
            requestAnimationFrame(function () {
                var sc = document.getElementById('chat-messages-scroll');
                if (sc) sc.scrollTop = sc.scrollHeight;
            });
        }
    }

    function goMessagesOpenChat(userId) {
        try { sessionStorage.setItem('cqx_open_chat', userId); } catch (e) {}
        window.location.href = 'prototype-messages.html';
    }

    function openChat(userId) {
        var t = ensureThread(userId);
        if (!t) return;
        activeChatId = userId;
        var nameEl = document.getElementById('chat-peer-name');
        var avEl = document.getElementById('chat-peer-avatar');
        if (nameEl) nameEl.textContent = t.name;
        if (avEl) avEl.src = t.avatar;
        dismissChatRisk();
        var inp = document.getElementById('chat-input');
        if (inp) inp.value = '';
        if (nameEl && avEl) {
            showPage('page-chat');
            renderChatMessages();
        } else {
            goMessagesOpenChat(userId);
        }
    }

    function openChatFromDetail() {
        goMessagesOpenChat('u1');
    }

    function openChatWithCurrentDetail() {
        goMessagesOpenChat(currentDetailUserId);
    }

    function dismissChatRisk() {
        var b = document.getElementById('chat-risk-banner');
        if (b) b.classList.add('hidden');
    }

    function sendChatMessage() {
        if (!activeChatId || !CHAT_STORE[activeChatId]) return;
        var input = document.getElementById('chat-input');
        var text = (input && input.value || '').trim();
        if (!text) return;
        var hit = detectThirdPartyRisk(text);
        if (hit) {
            var rt = document.getElementById('chat-risk-text');
            if (rt) rt.textContent = hit;
            var banner = document.getElementById('chat-risk-banner');
            if (banner) banner.classList.remove('hidden');
        }
        CHAT_STORE[activeChatId].messages.push({ from: 'me', text: text });
        CHAT_STORE[activeChatId].preview = text.length > 36 ? text.slice(0, 36) + '…' : text;
        CHAT_STORE[activeChatId].time = '刚刚';
        if (input) input.value = '';
        saveChatStore();
        renderChatMessages();
        renderMessagesList();
    }

    function onChatInputRiskCheck() {
        var input = document.getElementById('chat-input');
        if (!input) return;
        var hit = detectThirdPartyRisk(input.value);
        var banner = document.getElementById('chat-risk-banner');
        if (!hit) {
            if (banner) banner.classList.add('hidden');
            return;
        }
        var rt = document.getElementById('chat-risk-text');
        if (rt) rt.textContent = hit;
        if (banner) banner.classList.remove('hidden');
    }

    function swipeLeft() {
        var c = document.getElementById('user-card');
        if (!c) return;
        c.style.transform = 'translateX(-120%) rotate(-20deg)';
        setTimeout(function () { c.style.transform = ''; }, 500);
    }

    function swipeRight() {
        var c = document.getElementById('user-card');
        if (!c) return;
        c.style.transform = 'translateX(120%) rotate(20deg)';
        setTimeout(function () { c.style.transform = ''; }, 500);
    }

    var SCHOOL_DB = [
        { name: '清华大学', tier: '985' },
        { name: '北京大学', tier: '985' },
        { name: '复旦大学', tier: '985' },
        { name: '上海交通大学', tier: '985' },
        { name: '浙江大学', tier: '985' },
        { name: '南京大学', tier: '985' },
        { name: '中国科学技术大学', tier: '985' },
        { name: '北京工业大学', tier: '211' },
        { name: '北京邮电大学', tier: '211' },
        { name: '云南大学', tier: '211' },
        { name: '河北大学', tier: null },
        { name: '首都经济贸易大学', tier: null }
    ];

    function fuzzySchoolMatch(name, query) {
        if (!query.trim()) return false;
        var n = name.toLowerCase();
        var q = query.trim().toLowerCase();
        if (n.includes(q)) return true;
        var j = 0;
        for (var i = 0; i < n.length && j < q.length; i++) {
            if (n[i] === q[j]) j++;
        }
        return j === q.length;
    }

    function renderSchoolTierTags(tier) {
        var el = document.getElementById('school-tier-tags');
        if (!el) return;
        el.innerHTML = '';
        if (tier === '985') {
            el.innerHTML = '<span class="px-2 py-0.5 rounded-md text-xs font-semibold bg-red-100 text-red-700 border border-red-200">985</span><span class="px-2 py-0.5 rounded-md text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">211</span>';
        } else if (tier === '211') {
            el.innerHTML = '<span class="px-2 py-0.5 rounded-md text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">211</span>';
        }
    }

    function findSchoolByExactName(name) {
        for (var i = 0; i < SCHOOL_DB.length; i++) {
            if (SCHOOL_DB[i].name === name) return SCHOOL_DB[i];
        }
        return null;
    }

    (function initSchoolField() {
        var input = document.getElementById('school-input');
        var list = document.getElementById('school-suggestions');
        if (!input || !list) return;

        function showSuggestions(q) {
            var matches = SCHOOL_DB.filter(function (s) { return fuzzySchoolMatch(s.name, q); });
            if (!q.trim() || matches.length === 0) {
                list.classList.add('hidden');
                list.innerHTML = '';
                return;
            }
            list.innerHTML = matches.slice(0, 8).map(function (s) {
                var badges = s.tier === '985' ? '<span class="text-red-600 text-xs ml-1">985</span><span class="text-amber-700 text-xs ml-1">211</span>' :
                    s.tier === '211' ? '<span class="text-amber-700 text-xs ml-1">211</span>' : '';
                return '<button type="button" class="school-suggest-item w-full text-left px-4 py-2.5 text-sm text-gray-800 border-b border-gray-100 last:border-0 cursor-pointer" data-name="' + s.name + '">' + s.name + badges + '</button>';
            }).join('');
            list.classList.remove('hidden');
            list.querySelectorAll('.school-suggest-item').forEach(function (btn) {
                btn.addEventListener('click', function () {
                    var name = btn.getAttribute('data-name');
                    input.value = name;
                    var row = findSchoolByExactName(name);
                    renderSchoolTierTags(row ? row.tier : null);
                    list.classList.add('hidden');
                    list.innerHTML = '';
                });
            });
        }

        input.addEventListener('input', function () {
            var row = findSchoolByExactName(input.value.trim());
            if (row) renderSchoolTierTags(row.tier);
            else renderSchoolTierTags(null);
            showSuggestions(input.value);
        });

        input.addEventListener('blur', function () {
            setTimeout(function () {
                list.classList.add('hidden');
                var row = findSchoolByExactName(input.value.trim());
                renderSchoolTierTags(row ? row.tier : null);
            }, 200);
        });

        input.addEventListener('focus', function () { showSuggestions(input.value); });
    })();

    window.USERS_BY_ID = USERS_BY_ID;
    window.showPage = showPage;
    window.renderDailyReco = renderDailyReco;
    window.showDailyProfile = showDailyProfile;
    window.openChat = openChat;
    window.openChatFromDetail = openChatFromDetail;
    window.openChatWithCurrentDetail = openChatWithCurrentDetail;
    window.dismissChatRisk = dismissChatRisk;
    window.sendChatMessage = sendChatMessage;
    window.onChatInputRiskCheck = onChatInputRiskCheck;
    window.swipeLeft = swipeLeft;
    window.swipeRight = swipeRight;
    window.goMessagesOpenChat = goMessagesOpenChat;
    window.openReportFlow = openReportFlow;
    window.dismissReport = dismissReport;
    window.submitReport = submitReport;
    window.showVIPPopup = showVIPPopup;
    window.showGreetingLimit = showGreetingLimit;

    document.addEventListener('DOMContentLoaded', function () {
        var loaded = loadChatStore();
        if (loaded) CHAT_STORE = loaded;

        var ctx = document.body.getAttribute('data-cqx') || '';

        if (ctx === 'discover') {
            renderDailyReco();
        }
        if (ctx === 'messages') {
            renderMessagesList();
            var ci = document.getElementById('chat-input');
            if (ci) {
                ci.addEventListener('input', onChatInputRiskCheck);
                ci.addEventListener('keydown', function (e) {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendChatMessage();
                    }
                });
            }
            try {
                var p = sessionStorage.getItem('cqx_open_chat');
                if (p) {
                    sessionStorage.removeItem('cqx_open_chat');
                    openChat(p);
                }
            } catch (e) {}
        }
        if (ctx === 'mine') {
            if (window.location.hash === '#vip') {
                setTimeout(function () { showPage('page-vip'); }, 0);
            }
            if (window.location.hash === '#card') {
                setTimeout(function () { showPage('page-my-card'); }, 0);
            }
        }
    });
})();
