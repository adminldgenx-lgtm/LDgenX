// The appointment requests waiting for the team: new requests from clients and visitors, and
// changes of time asked by clients. Live: a request appears as soon as it is sent.
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useI18n } from '../i18n';
import { useData } from '../state';
import { Card, Empty, Loading, PageHeader } from '../ui';
import { TeamAppointmentRow } from '../team';

export function RequestsPage() {
  const { t } = useI18n();
  const appointments = useData(() => api.listAppointments(), []);
  const config = useData(() => api.getBookingConfig(), []);
  useEffect(() => {
    api.markActivityRead({ kinds: ['appointment_requested', 'change_requested'] }).catch(() => {});
  }, []);
  const all = appointments.data ?? [];
  const requests = all
    .filter((a) => a.status === 'requested')
    .sort((a, b) => a.start.localeCompare(b.start));
  const changes = all
    .filter((a) => a.status === 'confirmed' && a.change)
    .sort((a, b) => a.change!.start.localeCompare(b.change!.start));
  const auto = config.data?.approval === 'auto';
  return (
    <>
      <PageHeader title={t.nav.requests} lead={t.requests.lead} />
      {config.data && (
        <p className="p-mode">
          {auto ? t.requests.approvalAuto : t.requests.approvalManual}{' '}
          <Link to="/admin/parametres">{t.requests.changeSetting}</Link>
        </p>
      )}
      {!appointments.data || !config.data ? (
        <Loading lines={5} />
      ) : !requests.length && !changes.length ? (
        <Card>
          <Empty>{t.requests.empty}</Empty>
        </Card>
      ) : (
        <>
          {!!requests.length && (
            <Card title={`${t.requests.newRequests} · ${requests.length}`} pad={false}>
              <ul className="p-appointments">
                {requests.map((a) => (
                  <TeamAppointmentRow key={a.id} appointment={a} config={config.data!} />
                ))}
              </ul>
            </Card>
          )}
          {!!changes.length && (
            <Card title={`${t.requests.changes} · ${changes.length}`} pad={false}>
              <ul className="p-appointments">
                {changes.map((a) => (
                  <TeamAppointmentRow key={a.id} appointment={a} config={config.data!} />
                ))}
              </ul>
            </Card>
          )}
        </>
      )}
    </>
  );
}
