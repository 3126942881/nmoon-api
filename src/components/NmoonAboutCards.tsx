import { useState } from 'react';
import { createPortal } from 'react-dom';
import { openUrl } from '@tauri-apps/plugin-opener';
import { Copy, ExternalLink, Headphones, Info, Moon, Users, X } from 'lucide-react';
import { useEscCloseTopmost } from '../hooks/useEscClose';

const SUPPORT_QQ = '37579735';
const GROUP_QQ = '1108278250';
const WEBSITE = 'https://ai.lmgai.cn';
const SUPPORT_URL = `tencent://message/?uin=${SUPPORT_QQ}&Site=&Menu=yes`;
const GROUP_URL = 'https://qun.qq.com/universal-share/share?ac=1&authKey=MhZSTFcOOFdqCY9F639dtp3hZ8IscojqPhPWz2M12UJ%2FlrQgVCWKtYEyyn7qBpe5&busi_data=eyJncm91cENvZGUiOiIxMTA4Mjc4MjUwIiwidG9rZW4iOiJ4OGFXRWNMRkx6MkIwK2VMUVNLbzV0MEZ3NXAxWEhWdms0TVE0S2hrTG9qRExPcWxFVHd2eEc4K0pFWTJRSXFMIiwidWluIjoiMzc1Nzk3MzUifQ%3D%3D&data=wAJPR8n-ua6XNf_71gSkPcKEH4izQZv2nelp6IHO57vbL-_rs32jQ3qQWYtWCSeAHELZE7yG4cLMWCY5nXzc3g&svctype=4&tempid=h5_group_info';

type Detail = 'support' | 'group' | 'about';

export function NmoonAboutCards({ appVersion }: { appVersion: string }) {
  const [detail, setDetail] = useState<Detail | null>(null);
  const [message, setMessage] = useState('');
  useEscCloseTopmost(detail !== null, () => setDetail(null));

  const openContact = (target: 'support' | 'group') => {
    setMessage('');
    setDetail(target);
    void openUrl(target === 'support' ? SUPPORT_URL : GROUP_URL).catch(() => {
      setMessage('未能打开链接，请复制号码后在 QQ 中搜索。');
    });
  };

  const copyNumber = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setMessage('已复制');
    } catch {
      setMessage('复制失败，请选中号码手动复制。');
    }
  };

  const title = detail === 'support' ? '联系客服' : detail === 'group' ? '点击进群' : '关于';
  const number = detail === 'support' ? SUPPORT_QQ : GROUP_QQ;

  return (
    <>
      <div className="credits-list">
        <button type="button" className="credit-item" onClick={() => openContact('support')}>
          <div className="credit-icon"><Headphones size={24} /></div>
          <h3>联系客服</h3>
          <p>QQ：{SUPPORT_QQ}</p>
        </button>
        <button type="button" className="credit-item" onClick={() => openContact('group')}>
          <div className="credit-icon"><Users size={24} /></div>
          <h3>点击进群</h3>
          <p>QQ群：{GROUP_QQ}</p>
        </button>
        <button type="button" className="credit-item" onClick={() => {
          void openUrl(WEBSITE).catch(() => {
            setDetail('about');
            setMessage('未能打开浏览器，请访问 https://ai.lmgai.cn');
          });
        }}>
          <div className="credit-icon"><Moon size={24} /></div>
          <h3>进入中转站</h3>
          <p>小月神api · ai.lmgai.cn</p>
        </button>
        <button type="button" className="credit-item" onClick={() => {
          setMessage('');
          setDetail('about');
        }}>
          <div className="credit-icon"><Info size={24} /></div>
          <h3>关于</h3>
          <p>小月神api 定制版 · v{appVersion}</p>
        </button>
      </div>
      {detail && createPortal(
        <div className="modal-overlay" onClick={() => setDetail(null)}>
          <section className="modal nmoon-about-modal" role="dialog" aria-modal="true" aria-labelledby="nmoon-about-title" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h2 id="nmoon-about-title">{title}</h2>
              <button type="button" autoFocus className="modal-close" aria-label="关闭" onClick={() => setDetail(null)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              {detail === 'about' ? (
                <>
                  <p><strong>小月神api 定制版</strong> · v{appVersion}</p>
                  <p>网站：ai.lmgai.cn</p>
                  <p>客服 QQ：{SUPPORT_QQ}　QQ群：{GROUP_QQ}</p>
                  <p>基于 Cockpit Tools 修改，原作者 jlcodes99。原项目声明协议：CC-BY-NC-SA-4.0。</p>
                  <p>定制修改包括站点品牌、联系方式、供应商预设、模型支持和安装包更新方式。依原许可署名、非商业性使用，并以相同许可共享。</p>
                  <p>此版本由站长发布安装包更新。</p>
                  <button type="button" className="btn btn-secondary" onClick={() => {
                    void openUrl('https://github.com/jlcodes99/cockpit-tools').catch(() => setMessage('未能打开浏览器。'));
                  }}><ExternalLink size={16} /> 原项目</button>
                </>
              ) : (
                <>
                  <p>{detail === 'support' ? '客服 QQ' : 'QQ群'}：<strong className="nmoon-contact-number">{number}</strong></p>
                  <p>{detail === 'group' ? '已尝试打开 QQ 群分享页面。' : ''}如未跳转到 QQ，可复制号码，在 QQ 中搜索{detail === 'support' ? '添加客服' : '并申请入群'}。</p>
                  <div className="nmoon-contact-actions">
                    <button type="button" className="btn btn-primary" onClick={() => openContact(detail)}><ExternalLink size={16} /> {detail === 'group' ? '打开入群链接' : '打开 QQ'}</button>
                    <button type="button" className="btn btn-secondary" onClick={() => void copyNumber(number)}><Copy size={16} /> {detail === 'support' ? '复制 QQ 号' : '复制群号'}</button>
                  </div>
                </>
              )}
              {message && <p role="status">{message}</p>}
            </div>
          </section>
        </div>, document.body,
      )}
    </>
  );
}
