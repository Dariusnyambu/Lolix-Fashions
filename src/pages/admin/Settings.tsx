import { useEffect, useState } from 'react';
import { fetchSettings } from '@/services/catalog';
import { updateSettings } from '@/services/admin/catalog';
import type { Settings } from '@/types';
import { PageHeader, LoadingState, Field, TextInput, TextArea } from '@/components/admin/AdminUI';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/contexts/ToastContext';

export default function AdminSettings() {
  const [form, setForm] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetchSettings().then(setForm).finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    if (!form) return;
    setSaving(true);
    try {
      await updateSettings(form);
      showToast('Settings saved');
    } catch (err) {
      console.error(err);
      showToast('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingState />;
  if (!form) return null;

  function set<K extends keyof Settings>(key: K, value: Settings[K]) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  return (
    <div>
      <PageHeader title="Settings" subtitle="General store configuration" />

      <div className="max-w-2xl space-y-6">
        <div className="rounded-2xl bg-white p-5 shadow-[var(--shadow-soft)] space-y-4">
          <h3 className="text-sm font-bold text-royal-900">Business Information</h3>
          <Field label="Business Name"><TextInput value={form.business_name} onChange={(e) => set('business_name', e.target.value)} /></Field>
          <Field label="Business Description"><TextArea rows={2} value={form.business_description ?? ''} onChange={(e) => set('business_description', e.target.value)} /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Phone"><TextInput value={form.phone} onChange={(e) => set('phone', e.target.value)} /></Field>
            <Field label="WhatsApp Number"><TextInput value={form.whatsapp_number} onChange={(e) => set('whatsapp_number', e.target.value)} placeholder="254700000000" /></Field>
          </div>
          <Field label="Currency"><TextInput value={form.currency} onChange={(e) => set('currency', e.target.value)} /></Field>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-[var(--shadow-soft)] space-y-4">
          <h3 className="text-sm font-bold text-royal-900">Social Media</h3>
          <Field label="TikTok URL"><TextInput value={form.tiktok_url ?? ''} onChange={(e) => set('tiktok_url', e.target.value)} /></Field>
          <Field label="Facebook URL"><TextInput value={form.facebook_url ?? ''} onChange={(e) => set('facebook_url', e.target.value)} /></Field>
          <Field label="Instagram URL"><TextInput value={form.instagram_url ?? ''} onChange={(e) => set('instagram_url', e.target.value)} /></Field>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-[var(--shadow-soft)] space-y-4">
          <h3 className="text-sm font-bold text-royal-900">SEO Defaults</h3>
          <Field label="Default SEO Title"><TextInput value={form.seo_default_title ?? ''} onChange={(e) => set('seo_default_title', e.target.value)} /></Field>
          <Field label="Default SEO Description"><TextArea rows={2} value={form.seo_default_description ?? ''} onChange={(e) => set('seo_default_description', e.target.value)} /></Field>
        </div>

        <Button onClick={handleSave} disabled={saving} size="lg">{saving ? 'Saving…' : 'Save Settings'}</Button>
      </div>
    </div>
  );
}
