// src/components/Tutorial.jsx
// 6-step interactive tutorial overlay

import React from 'react';

const STEPS = [
  {
    title: 'ยินดีต้อนรับสู่ Geometric Defense!',
    content: 'ปกป้องฐานของคุณจากระลอกศัตรูเรขาคณิต วางยูนิตบนตารางเพื่อโจมตีศัตรูในขณะที่พวกมันเดินทางไปตามเส้นทางเรืองแสง',
    highlight: null,
    icon: '🎮',
  },
  {
    title: 'เลือกยูนิตของคุณ',
    content: 'คลิกการ์ดยูนิตที่แถบด้านซ้ายเพื่อเลือก ยูนิตแต่ละประเภทมีหน้าที่เฉพาะตัว — Triangle (สามเหลี่ยม) เน้นทำดาเมจ, Square (สี่เหลี่ยม) ใช้บล็อกศัตรู, Circle (วงกลม) ใช้ฮีลเพิ่มเลือด, Pentagon (ห้าเหลี่ยม) โจมตีหมู่ AOE และ Hexagon (หกเหลี่ยม) ช่วยลดความเร็วศัตรู',
    highlight: '#unit-btn-triangle',
    icon: '▲',
  },
  {
    title: 'วางยูนิตลงบนตาราง',
    content: 'หลังจากเลือกยูนิตแล้ว คลิกช่องว่างบนตาราง (ที่ไม่ใช่บนเส้นทางเดินศัตรู!) เพื่อวางยูนิต การวางยูนิตต้องใช้พลังงาน (Energy) — สะสมพลังงานเพิ่มได้จากการกำจัดศัตรู',
    highlight: '#game-canvas',
    icon: '📍',
  },
  {
    title: 'อัปเกรดยูนิต',
    content: 'คลิกที่ยูนิตที่วางอยู่เพื่อดูพลังความสามารถ อัปเกรดเป็น Tier II หรือ Tier III เพื่อเพิ่มพลังโจมตี, HP และระยะยิง โดยยูนิต Tier III จะปลดล็อกสกิลพิเศษสุดแกร่ง!',
    highlight: null,
    icon: '⬆️',
  },
  {
    title: 'เริ่มเวฟศัตรู',
    content: 'คลิกปุ่ม "Start Wave" ที่แถบด้านบนเมื่อคุณพร้อม ศัตรูจะเดินตามเส้นทางสีต่างๆ หากพวกมันทะลุไปถึงสุดขอบขวา คุณจะเสียพลังชีวิตของฐาน (Base HP)!',
    highlight: '#btn-start-wave',
    icon: '🌊',
  },
  {
    title: 'ปลดล็อกความสำเร็จและคอมโบ',
    content: 'คลิกปุ่มถ้วยรางวัล 🏆 ที่แถบด้านบนเพื่อดู "ความสำเร็จ" (Achievements)! และลองวางยูนิตที่ส่งเสริมกันให้อยู่ติดกันเพื่อเปิดใช้งานบัฟคอมโบสุดแกร่ง เช่น "Melee Vanguard" (+ความเร็วโจมตีของยูนิตบล็อก 20%)',
    highlight: '#btn-achievements',
    icon: '🏆',
  },
];

export default function Tutorial({ step, onNext, onSkip }) {
  if (step >= STEPS.length) return null;
  const s = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 400,
      pointerEvents: 'none',
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
      padding: '0 0 24px 0',
    }}>
      <div
        className="glass animate-fadeIn"
        style={{
          width: 440,
          padding: '20px 24px',
          border: '1px solid rgba(155,127,221,0.3)',
          boxShadow: '0 -8px 40px rgba(155,127,221,0.15)',
          pointerEvents: 'auto',
        }}
      >
        {/* Step indicator */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{
              flex: 1, height: 3, borderRadius: 2,
              background: i <= step ? '#9B7FDD' : 'rgba(255,255,255,0.1)',
              transition: 'background 0.3s',
            }} />
          ))}
        </div>

        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          <span style={{ fontSize: 28, flexShrink: 0 }}>{s.icon}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
              {s.title}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {s.content}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={onSkip} style={{ fontSize: 12 }}>
            ข้ามบทเรียน
          </button>
          <button
            className="btn btn-primary"
            onClick={onNext}
            style={{ fontSize: 12, padding: '7px 20px' }}
          >
            {isLast ? '✓ รับทราบ!' : 'ถัดไป →'}
          </button>
        </div>
      </div>
    </div>
  );
}
