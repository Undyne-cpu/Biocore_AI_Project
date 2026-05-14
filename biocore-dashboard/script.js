/**
 * BioCore Dashboard - Interactive Logic
 */

// 获取当前页面文件名
function getCurrentPage() {
    const url = window.location.href;
    let path = url.replace(/\/$/, '');
    let filename = path.split('/').pop();
    if (!filename || !filename.includes('.')) {
        return '';
    }
    return filename;
}

// 检查登录状态
function checkAuth() {
    // 开发模式：跳过登录验证，直接访问所有页面
    const devMode = localStorage.getItem('biocore_dev_mode');
    if (devMode === 'true') {
        console.log('开发模式：跳过登录验证');
        return true;
    }
    
    const currentPage = getCurrentPage();
    
    // 如果是登录或注册页面
    if (currentPage === 'login.html' || currentPage === 'register.html') {
        const userData = localStorage.getItem('biocore_user');
        if (userData) {
            try {
                const user = JSON.parse(userData);
                if (user.loggedIn) {
                    window.location.href = 'index.html';
                    return false;
                }
            } catch (e) {
                // 忽略解析错误
            }
        }
    } else {
        // 其他页面需要登录才能访问
        const userData = localStorage.getItem('biocore_user');
        if (!userData) {
            window.location.href = 'login.html';
            return false;
        }
        try {
            const user = JSON.parse(userData);
            if (!user.loggedIn) {
                window.location.href = 'login.html';
                return false;
            }
        } catch (e) {
            window.location.href = 'login.html';
            return false;
        }
    }
    
    return true;
}

// 执行登录检查
checkAuth();

// 初始化动画样式
function initAnimationStyles() {
    if (!document.querySelector('#biocore-animation-styles')) {
        const style = document.createElement('style');
        style.id = 'biocore-animation-styles';
        style.textContent = `
            @keyframes slideIn {
                from { opacity: 0; transform: translateX(100px); }
                to { opacity: 1; transform: translateX(0); }
            }
            @keyframes slideOut {
                from { opacity: 1; transform: translateX(0); }
                to { opacity: 0; transform: translateX(100px); }
            }
        `;
        document.head.appendChild(style);
    }
}

// 通知系统
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = 'notification notification-' + type;
    notification.innerHTML = '<i class="fas ' + getIconForType(type) + '"></i><span>' + message + '</span>';
    
    notification.style.cssText = 'position:fixed;top:20px;right:20px;padding:16px 24px;border-radius:8px;' +
        'background:' + getBackgroundForType(type) + ';color:#fff;font-size:0.9rem;font-weight:500;' +
        'display:flex;align-items:center;gap:12px;box-shadow:0 4px 20px rgba(0,0,0,0.3);' +
        'z-index:9999;animation:slideIn 0.3s ease forwards';
    
    document.body.appendChild(notification);
    
    setTimeout(function() {
        notification.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(function() {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

function getIconForType(type) {
    var icons = {
        success: 'fa-check-circle',
        error: 'fa-times-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle',
        danger: 'fa-exclamation-circle'
    };
    return icons[type] || icons.info;
}

function getBackgroundForType(type) {
    var colors = {
        success: 'linear-gradient(135deg, #10b981, #059669)',
        error: 'linear-gradient(135deg, #ef4444, #dc2626)',
        warning: 'linear-gradient(135deg, #f59e0b, #d97706)',
        info: 'linear-gradient(135deg, #3b82f6, #2563eb)',
        danger: 'linear-gradient(135deg, #dc2626, #b91c1c)'
    };
    return colors[type] || colors.info;
}

// 导航交互
function initNavigation() {
    var navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(function(item) {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            var href = item.getAttribute('href');
            
            if (!href || href === '#') return;
            
            navItems.forEach(function(nav) { nav.classList.remove('active'); });
            item.classList.add('active');
            
            window.location.href = href;
        });
    });
}

// 搜索功能
function initSearch() {
    var searchInput = document.querySelector('.search-box input');
    var searchBox = document.querySelector('.search-box');
    
    if (!searchInput || !searchBox) return;
    
    searchInput.addEventListener('input', function(e) {
        var query = e.target.value.trim();
        if (query.length > 0) {
            searchBox.classList.add('searching');
        } else {
            searchBox.classList.remove('searching');
        }
    });
    
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            var query = e.target.value.trim();
            if (query) {
                showNotification('正在搜索: ' + query, 'info');
            }
        }
    });
}

// 按钮交互
function initButtons() {
    var newProjectBtn = document.querySelector('.hero-actions .btn-primary');
    if (newProjectBtn) {
        newProjectBtn.addEventListener('click', function() {
            showNotification('打开新建项目对话框...', 'success');
        });
    }
    
    var uploadBtn = document.querySelector('.hero-actions .btn-secondary');
    if (uploadBtn) {
        uploadBtn.addEventListener('click', function() {
            showNotification('打开上传数据对话框...', 'success');
        });
    }
    
    var quickCards = document.querySelectorAll('.quick-card');
    quickCards.forEach(function(card) {
        card.addEventListener('click', function() {
            var title = card.querySelector('.quick-title').textContent;
            showNotification('启动 ' + title + ' 工具...', 'info');
        });
    });
    
    var projectItems = document.querySelectorAll('.project-item');
    projectItems.forEach(function(item) {
        item.addEventListener('click', function(e) {
            if (!e.target.closest('.icon-btn')) {
                var projectName = item.querySelector('.project-name').textContent;
                showNotification('打开项目: ' + projectName, 'success');
            }
        });
    });
    
    var templateCards = document.querySelectorAll('.template-card .btn');
    templateCards.forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            var templateName = btn.closest('.template-card').querySelector('.template-body h3').textContent;
            showNotification('使用模板创建项目: ' + templateName, 'success');
        });
    });
    
    var taskPauseBtns = document.querySelectorAll('.task-item .icon-btn:first-child');
    taskPauseBtns.forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            var icon = btn.querySelector('i');
            if (icon.classList.contains('fa-pause')) {
                icon.classList.remove('fa-pause');
                icon.classList.add('fa-play');
                showNotification('任务已暂停', 'warning');
            } else {
                icon.classList.remove('fa-play');
                icon.classList.add('fa-pause');
                showNotification('任务继续运行', 'success');
            }
        });
    });
}

// 进度环动画
function initProgressAnimations() {
    var progressRings = document.querySelectorAll('.ring-progress');
    
    progressRings.forEach(function(ring) {
        var card = ring.closest('.task-item');
        if (!card) return;
        
        var taskName = card.querySelector('.task-name');
        var progressText = card.querySelector('.progress-text');
        
        if (taskName && progressText) {
            console.log('Task: ' + taskName.textContent + ', Progress: ' + progressText.textContent);
        }
    });
}

// 模拟数据更新
function simulateDataUpdate() {
    setInterval(function() {
        var runningTasks = document.querySelectorAll('.task-progress-ring');
        runningTasks.forEach(function(ring) {
            var progressText = ring.querySelector('.progress-text');
            if (!progressText) return;
            
            var currentProgress = parseInt(progressText.textContent);
            if (currentProgress < 100) {
                var newProgress = Math.min(currentProgress + Math.random() * 2, 100);
                progressText.textContent = Math.round(newProgress) + '%';
                
                var ringProgress = ring.querySelector('.ring-progress');
                if (ringProgress) {
                    ringProgress.setAttribute('stroke-dasharray', newProgress + ', 100');
                }
            }
        });
    }, 5000);
}

// 控制台欢迎信息
console.log('%c BioCore 生物信息分析平台 ', 'background: linear-gradient(135deg, #667eea, #764ba2); color: white; font-size: 16px; padding: 10px 20px; border-radius: 5px;');
console.log('欢迎使用 BioCore 仪表盘 - v1.0.0');

// 项目数据
var projectsData = [
    { id: 1, name: '全基因组测序分析', description: '对100例肿瘤样本进行全基因组测序', type: 'wgs', status: 'completed', tags: ['肿瘤', '药物研发'], dataSize: '45.2 GB', samples: 100, updatedAt: '2小时前', members: 4 },
    { id: 2, name: '肝癌RNA-seq差异表达', description: '比较肝癌组织与癌旁组织的转录组差异表达', type: 'rna', status: 'active', tags: ['肿瘤', '免疫'], dataSize: '12.8 GB', samples: 24, updatedAt: '昨天', members: 2 },
    { id: 3, name: 'ChIP-seq调控网络', description: '研究转录因子调控网络', type: 'chip', status: 'completed', tags: ['神经科学'], dataSize: '8.5 GB', samples: 16, updatedAt: '3天前', members: 3 },
    { id: 4, name: '肠道微生物组分析', description: '分析肠道微生物与代谢性疾病的关系', type: 'meta', status: 'paused', tags: ['微生物', '药物'], dataSize: '156.3 GB', samples: 200, updatedAt: '1周前', members: 5 },
    { id: 5, name: '乳腺癌全外显子测序', description: '寻找乳腺癌相关致病基因', type: 'wes', status: 'active', tags: ['肿瘤'], dataSize: '28.6 GB', samples: 50, updatedAt: '2天前', members: 3 },
    { id: 6, name: '阿尔茨海默病研究', description: '研究AD相关的基因表达变化', type: 'rna', status: 'archived', tags: ['神经科学', '药物'], dataSize: '18.9 GB', samples: 36, updatedAt: '1个月前', members: 6 }
];

function getTypeInfo(type) {
    var types = {
        wgs: { icon: 'fa-dna', label: 'WGS', name: '全基因组' },
        rna: { icon: 'fa-rna', label: 'RNA', name: '转录组' },
        chip: { icon: 'fa-project-diagram', label: 'ChIP', name: 'ChIP-seq' },
        wes: { icon: 'fa-dna', label: 'WES', name: '全外显子' },
        meta: { icon: 'fa-microscope', label: 'Meta', name: '宏基因组' }
    };
    return types[type] || types.wgs;
}

function getStatusBadge(status) {
    var statuses = {
        active: { class: 'active', text: '进行中' },
        completed: { class: 'completed', text: '已完成' },
        archived: { class: 'archived', text: '已归档' },
        paused: { class: 'paused', text: '已暂停' }
    };
    return statuses[status] || statuses.active;
}

function generateProjectCard(project) {
    var typeInfo = getTypeInfo(project.type);
    var statusInfo = getStatusBadge(project.status);
    
    var tagsHtml = project.tags.map(function(tag) {
        return '<span class="project-tag">' + tag + '</span>';
    }).join('');
    
    return '<div class="project-card" data-id="' + project.id + '" data-type="' + project.type + '" data-status="' + project.status + '">' +
        '<div class="project-card-header ' + project.type + '">' +
        '<span class="project-type-badge"><i class="fas ' + typeInfo.icon + '"></i>' + typeInfo.label + '</span>' +
        '<div class="project-card-actions">' +
        '<button class="card-action-btn" title="编辑" onclick="event.stopPropagation(); editProject(' + project.id + ')"><i class="fas fa-edit"></i></button>' +
        '<button class="card-action-btn delete" title="删除" onclick="event.stopPropagation(); confirmDelete(' + project.id + ')"><i class="fas fa-trash"></i></button>' +
        '</div></div>' +
        '<div class="project-card-body">' +
        '<h3 class="project-card-title">' +project.name + '</h3>' +
        '<p class="project-card-desc">' + project.description + '</p>' +
        '<div class="project-tags">' + tagsHtml + '</div>' +
        '<div class="project-card-footer">' +
        '<div class="project-meta-info">' +
        '<span><i class="fas fa-database"></i>' + project.dataSize + '</span>' +
        '<span><i class="fas fa-tint"></i>' + project.samples + '</span>' +
        '<span><i class="fas fa-clock"></i>' + project.updatedAt + '</span></div>' +
        '<span class="project-status-badge ' + statusInfo.class + '">' + statusInfo.text + '</span></div></div></div>';
}

function renderProjects(projects) {
    var grid = document.getElementById('projectsGrid');
    if (grid) {
        grid.innerHTML = projects.map(generateProjectCard).join('');
        
        var cards = grid.querySelectorAll('.project-card');
        cards.forEach(function(card) {
            card.addEventListener('click', function() {
                var projectId = card.dataset.id;
                var project = projectsData.find(function(p) { return p.id === parseInt(projectId); });
                showNotification('打开项目: ' + project.name, 'success');
            });
        });
        
        var countEl = document.getElementById('projectCount');
        if (countEl) {
            countEl.textContent = projects.length;
        }
    }
}

function filterProjects() {
    var statusFilter = (document.getElementById('statusFilter') || { value: 'all' }).value;
    var typeFilter = (document.getElementById('typeFilter') || { value: 'all' }).value;
    var tagEl = document.querySelector('.tag.active');
    var tagFilter = tagEl ? tagEl.dataset.tag : 'all';
    var searchEl = document.getElementById('searchInput');
    var searchQuery = searchEl ? searchEl.value.toLowerCase() : '';
    
    var filtered = projectsData.filter(function(project) {
        var matchStatus = statusFilter === 'all' || project.status === statusFilter;
        var matchType = typeFilter === 'all' || project.type === typeFilter;
        var matchTag = tagFilter === 'all' || project.tags.includes(tagFilter);
        var matchSearch = project.name.toLowerCase().includes(searchQuery) || 
                          project.description.toLowerCase().includes(searchQuery);
        return matchStatus && matchType && matchTag && matchSearch;
    });
    
    renderProjects(filtered);
}

function initProjectsPage() {
    var grid = document.getElementById('projectsGrid');
    if (!grid) return;
    
    renderProjects(projectsData);
    
    var statusFilter = document.getElementById('statusFilter');
    var typeFilter = document.getElementById('typeFilter');
    var sortFilter = document.getElementById('sortFilter');
    var searchInput = document.getElementById('searchInput');
    
    if (statusFilter) statusFilter.addEventListener('change', filterProjects);
    if (typeFilter) typeFilter.addEventListener('change', filterProjects);
    if (sortFilter) sortFilter.addEventListener('change', filterProjects);
    if (searchInput) searchInput.addEventListener('input', filterProjects);
    
    document.querySelectorAll('.tag').forEach(function(tag) {
        tag.addEventListener('click', function() {
            document.querySelectorAll('.tag').forEach(function(t) { t.classList.remove('active'); });
            tag.classList.add('active');
            filterProjects();
        });
    });
    
    document.querySelectorAll('.view-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.view-btn').forEach(function(b) { b.classList.remove('active'); });
            btn.classList.add('active');
            var view = btn.dataset.view;
            var projectsGrid = document.getElementById('projectsGrid');
            if (projectsGrid) {
                if (view === 'list') {
                    projectsGrid.classList.add('list-view');
                } else {
                    projectsGrid.classList.remove('list-view');
                }
            }
        });
    });
    
    var newProjectBtn = document.getElementById('newProjectBtn');
    var modal = document.getElementById('newProjectModal');
    var closeModal = document.getElementById('closeModal');
    var cancelBtn = document.getElementById('cancelBtn');
    var createBtn = document.getElementById('createBtn');
    
    if (newProjectBtn && modal) {
        newProjectBtn.addEventListener('click', function() {
            modal.classList.add('active');
        });
        
        if (closeModal) closeModal.addEventListener('click', function() {
            modal.classList.remove('active');
        });
        
        if (cancelBtn) cancelBtn.addEventListener('click', function() {
            modal.classList.remove('active');
        });
        
        if (createBtn) createBtn.addEventListener('click', function() {
            var nameInput = document.getElementById('projectName');
            var name = nameInput ? nameInput.value : '';
            if (name) {
                showNotification('项目 "' + name + '" 创建成功!', 'success');
                modal.classList.remove('active');
                if (nameInput) nameInput.value = '';
                var descInput = document.getElementById('projectDesc');
                if (descInput) descInput.value = '';
            } else {
                showNotification('请输入项目名称', 'warning');
            }
        });
    }
}

window.editProject = function(id) {
    var project = projectsData.find(function(p) { return p.id === id; });
    if (project) {
        showNotification('编辑项目: ' + project.name, 'info');
    }
};

window.confirmDelete = function(id) {
    var project = projectsData.find(function(p) { return p.id === id; });
    if (project) {
        var nameEl = document.getElementById('deleteProjectName');
        var modal = document.getElementById('deleteModal');
        var confirmBtn = document.getElementById('confirmDelete');
        
        if (nameEl) nameEl.textContent = project.name;
        if (modal) modal.classList.add('active');
        if (confirmBtn) {
            confirmBtn.onclick = function() {
                showNotification('项目 "' + project.name + '" 已删除', 'success');
                closeDeleteModal();
            };
        }
    }
};

window.closeDeleteModal = function() {
    var modal = document.getElementById('deleteModal');
    if (modal) modal.classList.remove('active');
};

function initAuthState() {
    var userData = localStorage.getItem('biocore_user');
    var userProfile = document.querySelector('.user-profile');
    
    if (userProfile) {
        if (userData) {
            try {
                var user = JSON.parse(userData);
                if (user.loggedIn) {
                    var avatar = userProfile.querySelector('.avatar');
                    var userName = userProfile.querySelector('.user-name');
                    
                    if (avatar && user.name) avatar.textContent = user.name.charAt(0);
                    if (userName && user.name) userName.textContent = user.name;
                }
            } catch (e) {}
        }
        
        var existingLogoutBtn = userProfile.querySelector('.logout-btn');
        if (!existingLogoutBtn && userData) {
            var logoutBtn = document.createElement('button');
            logoutBtn.className = 'logout-btn';
            logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> 退出';
            logoutBtn.style.cssText = 'display:flex;align-items:center;gap:8px;width:100%;margin-top:8px;padding:10px 12px;background:transparent;border:1px solid var(--border);border-radius:8px;color:var(--text-secondary);font-size:0.85rem;cursor:pointer;transition:all 0.2s ease';
            
            logoutBtn.addEventListener('click', function() {
                localStorage.removeItem('biocore_user');
                showNotification('已退出登录', 'success');
                setTimeout(function() {
                    window.location.href = 'login.html';
                }, 500);
            });
            
            logoutBtn.addEventListener('mouseenter', function() {
                logoutBtn.style.background = 'var(--bg-hover)';
                logoutBtn.style.color = 'var(--danger)';
                logoutBtn.style.borderColor = 'var(--danger)';
            });
            
            logoutBtn.addEventListener('mouseleave', function() {
                logoutBtn.style.background = 'transparent';
                logoutBtn.style.color = 'var(--text-secondary)';
                logoutBtn.style.borderColor = 'var(--border)';
            });
            
            userProfile.parentElement.appendChild(logoutBtn);
        }
    }
}

// ========================================
// Data Management Page Logic
// ========================================

// 模拟数据文件
var dataFiles = [
    { id: 1, name: 'sample_1_R1.fastq.gz', size: '2.4 GB', type: 'fastq', project: '全基因组测序分析', uploadTime: '2024-03-15 14:30', md5: 'a1b2c3d4e5f6789012345678' },
    { id: 2, name: 'sample_1_R2.fastq.gz', size: '2.6 GB', type: 'fastq', project: '全基因组测序分析', uploadTime: '2024-03-15 14:35', md5: 'b2c3d4e5f6789012345678a' },
    { id: 3, name: 'tumor_sample.bam', size: '8.9 GB', type: 'bam', project: '肝癌RNA-seq差异表达', uploadTime: '2024-03-14 09:20', md5: 'c3d4e5f6789012345678ab' },
    { id: 4, name: 'variants.vcf.gz', size: '156 MB', type: 'vcf', project: '乳腺癌全外显子测序', uploadTime: '2024-03-13 16:45', md5: 'd4e5f6789012345678abc' },
    { id: 5, name: 'reference_genome.fa', size: '3.2 GB', type: 'fasta', project: 'ChIP-seq调控网络', uploadTime: '2024-03-12 11:00', md5: 'e5f6789012345678abcd' },
    { id: 6, name: 'peaks.bed', size: '24 MB', type: 'bed', project: 'ChIP-seq调控网络', uploadTime: '2024-03-12 11:15', md5: 'f6789012345678abcde' },
    { id: 7, name: 'gene_annotation.gtf', size: '89 MB', type: 'gtf', project: '阿尔茨海默病研究', uploadTime: '2024-03-11 08:30', md5: '6789012345678abcdef' },
    { id: 8, name: 'control_1.fastq.gz', size: '1.8 GB', type: 'fastq', project: '肝癌RNA-seq差异表达', uploadTime: '2024-03-10 15:00', md5: '789012345678abcdef0' },
    { id: 9, name: 'somatic_variants.vcf', size: '45 MB', type: 'vcf', project: '儿童白血病WGS', uploadTime: '2024-03-09 10:20', md5: '89012345678abcdef01' },
    { id: 10, name: 'transcriptome.fa', size: '245 MB', type: 'fasta', project: '植物抗逆性转录组', uploadTime: '2024-03-08 14:00', md5: '9012345678abcdef012' },
    { id: 11, name: 'chip_input.bam', size: '12.3 GB', type: 'bam', project: '免疫检查点治疗分析', uploadTime: '2024-03-07 09:30', md5: '012345678abcdef0123' },
    { id: 12, name: 'methylation.bed', size: '67 MB', type: 'bed', project: '肠道微生物组分析', uploadTime: '2024-03-06 16:45', md5: '12345678abcdef01234' }
];

// 上传队列
var uploadQueue = [];

// 获取文件类型图标
function getFileIcon(type) {
    var icons = {
        fastq: 'fa-file-code',
        bam: 'fa-file-medical',
        vcf: 'fa-file-alt',
        fasta: 'fa-dna',
        bed: 'fa-th',
        gtf: 'fa-code',
        other: 'fa-file'
    };
    return icons[type] || icons.other;
}

// 获取文件类型显示名称
function getFileTypeName(type) {
    var names = {
        fastq: 'FASTQ',
        bam: 'BAM',
        vcf: 'VCF',
        fasta: 'FASTA',
        bed: 'BED',
        gtf: 'GTF',
        other: 'Other'
    };
    return names[type] || names.other;
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes.indexOf('GB') !== -1) return bytes;
    if (bytes.indexOf('MB') !== -1) return bytes;
    if (bytes.indexOf('KB') !== -1) return bytes;
    return bytes;
}

// 生成数据文件卡片HTML
function generateDataFileCard(file) {
    var iconClass = getFileIcon(file.type);
    var typeName = getFileTypeName(file.type);
    
    return '<div class="data-file" data-id="' + file.id + '" onclick="openDataDetail(' + file.id + ')">' +
        '<div class="data-file-header">' +
        '<div class="data-file-actions">' +
        '<button class="data-action-btn" onclick="event.stopPropagation(); downloadDataFile(' + file.id + ')" title="下载"><i class="fas fa-download"></i></button>' +
        '<button class="data-action-btn delete" onclick="event.stopPropagation(); confirmDeleteData(' + file.id + ')" title="删除"><i class="fas fa-trash"></i></button>' +
        '</div>' +
        '<span class="data-file-badge">' + typeName + '</span>' +
        '<div class="data-file-icon ' + file.type + '"><i class="fas ' + iconClass + '"></i></div>' +
        '</div>' +
        '<div class="data-file-body">' +
        '<div class="data-file-name" title="' + file.name + '">' + file.name + '</div>' +
        '<div class="data-file-project"><i class="fas fa-folder"></i> ' + file.project + '</div>' +
        '<div class="data-file-meta">' +
        '<span><i class="fas fa-database"></i>' + file.size + '</span>' +
        '<span><i class="fas fa-clock"></i>' + file.uploadTime.substring(5) + '</span>' +
        '</div>' +
        '</div>' +
        '</div>';
}

// 渲染数据文件列表
function renderDataFiles(files) {
    var grid = document.getElementById('dataGrid');
    var emptyState = document.getElementById('emptyState');
    
    if (!grid) return;
    
    if (files.length === 0) {
        grid.innerHTML = '';
        grid.style.display = 'none';
        if (emptyState) emptyState.style.display = 'block';
        return;
    }
    
    if (emptyState) emptyState.style.display = 'none';
    grid.style.display = 'grid';
    
    grid.innerHTML = files.map(generateDataFileCard).join('');
    
    // 更新统计信息
    updateDataStats(files);
}

// 更新数据统计
function updateDataStats(files) {
    var totalSize = 0;
    var counts = { fastq: 0, bam: 0, vcf: 0, fasta: 0, bed: 0, gtf: 0, other: 0 };
    
    files.forEach(function(file) {
        // 解析文件大小
        var sizeStr = file.size;
        var sizeNum = parseFloat(sizeStr);
        if (sizeStr.indexOf('GB') !== -1) {
            totalSize += sizeNum * 1024; // 转换为MB
        } else if (sizeStr.indexOf('MB') !== -1) {
            totalSize += sizeNum;
        }
        
        counts[file.type] = (counts[file.type] || 0) + 1;
    });
    
    // 更新显示
    var totalGB = (totalSize / 1024).toFixed(2);
    var percent = ((totalSize / 1024) / 500 * 100).toFixed(1);
    
    var dataCount = document.getElementById('dataCount');
    var storageUsed = document.getElementById('storageUsed');
    var usedSpace = document.getElementById('usedSpace');
    var storageFill = document.getElementById('storageFill');
    var storagePercent = document.getElementById('storagePercent');
    
    if (dataCount) dataCount.textContent = files.length;
    if (storageUsed) storageUsed.textContent = totalGB;
    if (usedSpace) usedSpace.textContent = totalGB;
    if (storageFill) storageFill.style.width = percent + '%';
    if (storagePercent) storagePercent.textContent = percent + '%';
    
    // 更新各类型计数
    var fastqCount = document.getElementById('fastqCount');
    var bamCount = document.getElementById('bamCount');
    var vcfCount = document.getElementById('vcfCount');
    var fastaCount = document.getElementById('fastaCount');
    
    if (fastqCount) fastqCount.textContent = counts.fastq;
    if (bamCount) bamCount.textContent = counts.bam;
    if (vcfCount) vcfCount.textContent = counts.vcf;
    if (fastaCount) fastaCount.textContent = counts.fasta + counts.bed + counts.gtf;
}

// 筛选数据文件
function filterDataFiles() {
    var typeFilter = (document.getElementById('typeFilter') || { value: 'all' }).value;
    var projectFilter = (document.getElementById('projectFilter') || { value: 'all' }).value;
    var searchInput = document.getElementById('searchInput');
    var searchQuery = searchInput ? searchInput.value.toLowerCase() : '';
    
    var filtered = dataFiles.filter(function(file) {
        var matchType = typeFilter === 'all' || file.type === typeFilter;
        var matchProject = projectFilter === 'all' || file.project === projectFilter;
        var matchSearch = file.name.toLowerCase().includes(searchQuery) || 
                          file.project.toLowerCase().includes(searchQuery);
        return matchType && matchProject && matchSearch;
    });
    
    renderDataFiles(filtered);
}

// 打开数据详情
window.openDataDetail = function(id) {
    var file = dataFiles.find(function(f) { return f.id === id; });
    if (!file) return;
    
    var modal = document.getElementById('detailModal');
    if (!modal) return;
    
    // 填充数据
    document.getElementById('detailTitle').innerHTML = '<i class="fas ' + getFileIcon(file.type) + '"></i> ' + file.name;
    document.getElementById('detailFileName').textContent = file.name;
    document.getElementById('detailSize').textContent = file.size;
    document.getElementById('detailType').textContent = getFileTypeName(file.type);
    document.getElementById('detailUploadTime').textContent = file.uploadTime;
    document.getElementById('detailProject').textContent = file.project;
    document.getElementById('detailMd5').textContent = file.md5;
    
    // 模拟文件预览
    var previewText = document.getElementById('previewText');
    if (previewText) {
        previewText.textContent = '@SRR001.1 DDBJ_accession\n' +
            'GATTTGGGGTTCAAAGCAGTATCGATCAAATAGTAAATCCATTTGTTCAACTCACAGTTT\n' +
            '+\n' +
            '!*******************************.******************************\n' +
            '@SRR001.2 DDBJ_accession\n' +
            'GATTTGGGGTTCAAAGCAGTATCGATCAAATAGTAAATCCATTTGTTCAACTCACAGTTT\n' +
            '+\n' +
            '!*******************************.******************************\n' +
            '@SRR001.3 DDBJ_accession\n' +
            'CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC\n' +
            '+\n' +
            '****************************************************************\n' +
            '(文件内容预览仅显示前几行，实际文件请下载查看完整内容)';
    }
    
    // 下载按钮
    var downloadBtn = document.getElementById('downloadFile');
    if (downloadBtn) {
        downloadBtn.onclick = function() { downloadDataFile(id); };
    }
    
    // 删除按钮
    var deleteBtn = document.getElementById('deleteFile');
    if (deleteBtn) {
        deleteBtn.onclick = function() {
            closeDetailModal();
            confirmDeleteData(id);
        };
    }
    
    modal.classList.add('active');
};

// 关闭详情模态框
window.closeDetailModal = function() {
    var modal = document.getElementById('detailModal');
    if (modal) modal.classList.remove('active');
};

// 下载数据文件
window.downloadDataFile = function(id) {
    var file = dataFiles.find(function(f) { return f.id === id; });
    if (file) {
        showNotification('开始下载: ' + file.name, 'info');
    }
};

// 确认删除数据文件
window.confirmDeleteData = function(id) {
    var file = dataFiles.find(function(f) { return f.id === id; });
    if (!file) return;
    
    var modal = document.getElementById('deleteModal');
    if (!modal) return;
    
    document.getElementById('deleteFileName').textContent = file.name;
    
    var confirmBtn = document.getElementById('confirmDelete');
    if (confirmBtn) {
        confirmBtn.onclick = function() {
            // 从列表中移除
            dataFiles = dataFiles.filter(function(f) { return f.id !== id; });
            filterDataFiles();
            closeDeleteModal();
            showNotification('文件 "' + file.name + '" 已删除', 'success');
        };
    }
    
    modal.classList.add('active');
};

// 关闭删除模态框
window.closeDeleteModal = function() {
    var modal = document.getElementById('deleteModal');
    if (modal) modal.classList.remove('active');
};

// 初始化上传模态框
function initUploadModal() {
    var uploadBtn = document.getElementById('uploadDataBtn');
    var emptyUploadBtn = document.getElementById('emptyUploadBtn');
    var modal = document.getElementById('uploadModal');
    var closeBtn = document.getElementById('closeUploadModal');
    var cancelBtn = document.getElementById('cancelUpload');
    
    function openModal() {
        if (modal) modal.classList.add('active');
    }
    
    function closeModal() {
        if (modal) modal.classList.remove('active');
    }
    
    if (uploadBtn) uploadBtn.addEventListener('click', openModal);
    if (emptyUploadBtn) emptyUploadBtn.addEventListener('click', openModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
    
    // 上传方式切换
    var methods = document.querySelectorAll('.upload-method');
    methods.forEach(function(method) {
        method.addEventListener('click', function() {
            methods.forEach(function(m) { m.classList.remove('active'); });
            this.classList.add('active');
            
            var methodType = this.dataset.method;
            document.getElementById('localUpload').style.display = methodType === 'local' ? 'block' : 'none';
            document.getElementById('urlUpload').style.display = methodType === 'url' ? 'block' : 'none';
            document.getElementById('sraUpload').style.display = methodType === 'sra' ? 'block' : 'none';
        });
    });
    
    // 文件上传区域
    var uploadArea = document.getElementById('uploadArea');
    var fileInput = document.getElementById('fileInput');
    
    if (uploadArea) {
        uploadArea.addEventListener('click', function() {
            if (fileInput) fileInput.click();
        });
        
        uploadArea.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.classList.add('dragover');
        });
        
        uploadArea.addEventListener('dragleave', function() {
            this.classList.remove('dragover');
        });
        
        uploadArea.addEventListener('drop', function(e) {
            e.preventDefault();
            this.classList.remove('dragover');
            handleFiles(e.dataTransfer.files);
        });
    }
    
    if (fileInput) {
        fileInput.addEventListener('change', function() {
            handleFiles(this.files);
        });
    }
    
    // 清空队列
    var clearQueue = document.getElementById('clearQueue');
    if (clearQueue) {
        clearQueue.addEventListener('click', function() {
            uploadQueue = [];
            renderUploadQueue();
            updateUploadButton();
        });
    }
}

// 处理上传的文件
function handleFiles(files) {
    for (var i = 0; i < files.length; i++) {
        var file = files[i];
        var ext = file.name.split('.').pop().toLowerCase();
        
        var type = 'other';
        if (ext === 'fastq' || ext === 'fq' || ext === 'gz') {
            type = 'fastq';
            if (ext === 'gz') {
                var nameWithoutExt = file.name.replace(/\.gz$/, '');
                var innerExt = nameWithoutExt.split('.').pop().toLowerCase();
                if (innerExt === 'fastq' || innerExt === 'fq') type = 'fastq';
            }
        } else if (ext === 'bam') {
            type = 'bam';
        } else if (ext === 'vcf') {
            type = 'vcf';
        } else if (ext === 'fa' || ext === 'fasta') {
            type = 'fasta';
        } else if (ext === 'bed') {
            type = 'bed';
        } else if (ext === 'gtf' || ext === 'gff') {
            type = 'gtf';
        }
        
        uploadQueue.push({
            name: file.name,
            size: formatBytes(file.size),
            type: type,
            status: 'pending',
            progress: 0
        });
    }
    
    renderUploadQueue();
    updateUploadButton();
}

// 格式化字节大小
function formatBytes(bytes) {
    if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(2) + ' GB';
    if (bytes >= 1048576) return (bytes / 1048576).toFixed(2) + ' MB';
    if (bytes >= 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return bytes + ' B';
}

// 渲染上传队列
function renderUploadQueue() {
    var queueList = document.getElementById('queueList');
    var queueCount = document.getElementById('queueCount');
    
    if (!queueList) return;
    
    if (queueCount) queueCount.textContent = uploadQueue.length;
    
    if (uploadQueue.length === 0) {
        queueList.innerHTML = '<div style="text-align:center;color:var(--text-muted);padding:20px;">暂无上传文件</div>';
        return;
    }
    
    queueList.innerHTML = uploadQueue.map(function(file, index) {
        return '<div class="queue-item">' +
            '<div class="queue-item-icon"><i class="fas ' + getFileIcon(file.type) + '"></i></div>' +
            '<div class="queue-item-info">' +
            '<div class="queue-item-name">' + file.name + '</div>' +
            '<div class="queue-item-size">' + file.size + '</div>' +
            '<div class="queue-item-progress"><div class="queue-item-progress-fill" style="width:' + file.progress + '%"></div></div>' +
            '</div>' +
            '<span class="queue-item-status ' + file.status + '">' + 
            (file.status === 'pending' ? '等待中' : file.status === 'uploading' ? '上传中' : file.status === 'done' ? '完成' : '错误') +
            '</span>' +
            '<button class="queue-item-remove" onclick="removeFromQueue(' + index + ')"><i class="fas fa-times"></i></button>' +
            '</div>';
    }).join('');
}

// 从队列移除
window.removeFromQueue = function(index) {
    uploadQueue.splice(index, 1);
    renderUploadQueue();
    updateUploadButton();
};

// 更新上传按钮状态
function updateUploadButton() {
    var startBtn = document.getElementById('startUpload');
    if (startBtn) {
        startBtn.disabled = uploadQueue.length === 0;
    }
}

// 初始化数据管理页面
function initDataPage() {
    // 检查是否是数据管理页面
    var dataGrid = document.getElementById('dataGrid');
    if (!dataGrid) return;
    
    // 渲染初始数据
    renderDataFiles(dataFiles);
    
    // 绑定筛选事件
    var typeFilter = document.getElementById('typeFilter');
    var projectFilter = document.getElementById('projectFilter');
    var sortFilter = document.getElementById('sortFilter');
    var searchInput = document.getElementById('searchInput');
    
    if (typeFilter) typeFilter.addEventListener('change', filterDataFiles);
    if (projectFilter) projectFilter.addEventListener('change', filterDataFiles);
    if (sortFilter) sortFilter.addEventListener('change', filterDataFiles);
    if (searchInput) searchInput.addEventListener('input', filterDataFiles);
    
    // 视图切换
    var viewBtns = document.querySelectorAll('.view-btn');
    viewBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
            viewBtns.forEach(function(b) { b.classList.remove('active'); });
            this.classList.add('active');
            var view = this.dataset.view;
            if (view === 'list') {
                dataGrid.classList.add('list-view');
            } else {
                dataGrid.classList.remove('list-view');
            }
        });
    });
    
    // 刷新按钮
    var refreshBtn = document.getElementById('refreshDataBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            showNotification('刷新数据列表...', 'info');
            filterDataFiles();
        });
    }
    
    // 初始化上传模态框
    initUploadModal();
    
    // 模态框点击外部关闭
    var modals = document.querySelectorAll('.modal-overlay');
    modals.forEach(function(modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('active');
            }
        });
    });
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initAnimationStyles();
    initNavigation();
    initSearch();
    initButtons();
    initProgressAnimations();
    initProjectsPage();
    initAuthState();
    initDataPage();
    simulateDataUpdate();
});