import React from 'react';
import { ShieldCheck, AlertOctagon, HelpCircle, Lock, Cpu, Server, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../data/translations';

interface EducationalInsightProps {
  language: Language;
}

export const EducationalInsight: React.FC<EducationalInsightProps> = ({ language }) => {
  const t = translations[language];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-6">
      
      {/* Title */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {t.securityTitle}
          </h2>
        </div>
        <p className="text-xs text-slate-400">
          {t.securitySubtitle}
        </p>
      </div>

      {/* Warning / Anti-Scam Callout */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 space-y-2">
        <div className="flex items-center gap-2 text-amber-300 font-bold text-xs sm:text-sm">
          <AlertOctagon className="w-5 h-5 text-amber-400 shrink-0" />
          <span>
            {language === 'hi'
              ? 'महत्वपूर्ण जानकारी: ब्लॉकचेन क्रिप्टोग्राफी और फ्लैश सॉफ्टवेयर का सच'
              : 'Important Notice: The Cryptographic Reality of Blockchain & Flash Software'}
          </span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          {language === 'hi'
            ? 'क्रिप्टोकरेंसी (जैसे Bitcoin, USDT TRC-20, TRON) एक विकेन्द्रीकृत (Decentralized) और क्रिप्टोग्राफिक बहीखाते (Distributed Ledger) पर आधारित होती हैं। कोई भी सॉफ्टवेयर या वेबसाइट बिना असली फंड्स या वास्तविक माइनिंग के रियल ब्लॉकचेन मेननेट पर असली बिटकॉइन नहीं बना सकती। यह वेबसाइट एक उन्नत सिम्युलेटर (Sandbox Lab) है जो यह सिखाती है कि 200-दिन टाइम-लॉक, मेमपूल, और वॉलेट ट्रांसफर कैसे काम करते हैं।'
            : 'Cryptocurrencies (such as Bitcoin, USDT TRC-20, TRON) operate on cryptographic distributed ledgers. No software or tool can create unbacked coins on the real mainnet out of thin air. This application is an advanced interactive sandbox lab built to demonstrate how time-lock smart contracts, mempool propagation, and multi-wallet balance states work.'}
        </p>
      </div>

      {/* 3 Detailed Technical Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Pillar 1: Consensus */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2.5">
          <div className="flex items-center gap-2 text-indigo-400">
            <Cpu className="w-5 h-5" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200">
              {language === 'hi' ? '1. ब्लॉकचेन कंसेंसस' : '1. Blockchain Consensus'}
            </h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {language === 'hi'
              ? 'बिटकॉइन में Proof-of-Work (PoW) और ट्रॉन में DPoS होता है। हजारों वैश्विक नोड्स हर ट्रांजेक्शन की डिजिटल सिग्नेचर और पुराने ब्लॉक इतिहास की पुष्टि करते हैं। अवैध सिक्के तुरंत रिजेक्ट हो जाते हैं।'
              : 'Bitcoin PoW and TRON DPoS require thousands of global independent nodes to verify cryptographic signatures against historical UTXOs. Unmined transactions are instantly rejected.'}
          </p>
        </div>

        {/* Pillar 2: 200-Day Time-Lock / TTL */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2.5">
          <div className="flex items-center gap-2 text-emerald-400">
            <Lock className="w-5 h-5" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200">
              {language === 'hi' ? '2. 200-दिन टाइम-लॉक' : '2. 200-Day Time-Lock TTL'}
            </h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {language === 'hi'
              ? 'स्मार्ट कॉन्ट्रैक्ट्स में OP_CHECKLOCKTIMEVERIFY या टाइमस्टैम्प कंडीशन से टोकन की वैलिडिटी तय की जा सकती है। 200 दिन की समाप्ति के बाद टाइमर ट्रिगर होकर बैलेंस को निष्क्रिय या बर्न कर देता है।'
              : 'Smart contracts use opcodes like OP_CHECKLOCKTIMEVERIFY to define strict validity lifecycles. After the 200-day deadline, the asset script automatically expires.'}
          </p>
        </div>

        {/* Pillar 3: Official Testnets */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2.5">
          <div className="flex items-center gap-2 text-amber-400">
            <Server className="w-5 h-5" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200">
              {language === 'hi' ? '3. टेस्टनेट और फॉसेट' : '3. Official Testnets & Faucets'}
            </h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {language === 'hi'
              ? 'यदि आप ऐप डेवलपमेंट या वॉलेट टेस्टिंग करना चाहते हैं, तो हमेशा आधिकारिक टेस्टनेट (जैसे Bitcoin Testnet4, Tron Nile Testnet, Sepolia) का उपयोग करें जहाँ मुफ्त टेस्टनेट कॉइन्स उपलब्ध होते हैं।'
              : 'Developers testing smart contracts and wallet interfaces should use public testnets (e.g. Bitcoin Testnet4, Tron Nile, Ethereum Sepolia) which provide free sandbox tokens.'}
          </p>
        </div>

      </div>

      {/* Safety Checklist */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>
            {language === 'hi' ? 'सुरक्षा दिशानिर्देश (Security Checklist)' : 'Crypto Security & Anti-Fraud Best Practices'}
          </span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-400">
          <div className="flex items-start gap-2 bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
            <span className="text-emerald-400 font-bold">✓</span>
            <span>
              {language === 'hi'
                ? 'कभी भी टेलीग्राम या व्हाट्सएप पर "Flash BTC सॉफ्टवेयर" बेचने वालों को पैसे न दें।'
                : 'Never pay scammers offering "Flash BTC software" or "Flash USDT generators" on social media.'}
            </span>
          </div>

          <div className="flex items-start gap-2 bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
            <span className="text-emerald-400 font-bold">✓</span>
            <span>
              {language === 'hi'
                ? 'किसी भी लेन-देन को मान्य करने से पहले हमेशा ब्लॉकचेन एक्सप्लोरर पर 6+ कन्फर्मेशन चेक करें।'
                : 'Always verify on-chain confirmations (6+ blocks on Bitcoin) via an independent public block explorer.'}
            </span>
          </div>

          <div className="flex items-start gap-2 bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
            <span className="text-emerald-400 font-bold">✓</span>
            <span>
              {language === 'hi'
                ? 'अपनी प्राइवेट की (Private Key) और 12-शब्दों की सीक्रेट रिकवरी फ्रेज कभी किसी के साथ शेयर न करें।'
                : 'Never share your 12-word recovery seed phrase or private keys with any third-party app.'}
            </span>
          </div>

          <div className="flex items-start gap-2 bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
            <span className="text-emerald-400 font-bold">✓</span>
            <span>
              {language === 'hi'
                ? 'यह ऐप केवल शैक्षिक उद्देश्य (Educational Sandbox) के लिए बनाया गया है।'
                : 'This interactive application is designed purely as an educational sandbox environment.'}
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};
