import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { toast } from '@spartan-ng/brain/sonner';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiSubmission, mapSubmission } from '../api/api-mappers';
import { extractApiError } from '../api/api-error.util';
import { Submission, SubmissionStatus, SubmissionType } from '../models/support.model';

export interface SubmissionFilter {
  type?: SubmissionType;
  status?: SubmissionStatus;
}

export interface CreateSubmissionPayload {
  type: SubmissionType;
  title: string;
  body: string;
}

export type AdminStatus = 'approved' | 'rejected' | 'in_progress' | 'done';

@Injectable({ providedIn: 'root' })
export class SupportService {
  private readonly http = inject(HttpClient);
  private readonly translate = inject(TranslateService);

  private readonly _submissions = signal<Submission[]>([]);
  private readonly _isLoading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly submissions = this._submissions.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();

  async loadSubmissions(filter?: SubmissionFilter): Promise<void> {
    this._isLoading.set(true);
    this._error.set(null);
    let params = new HttpParams();
    if (filter?.type) params = params.set('type', filter.type);
    if (filter?.status) params = params.set('status', filter.status);
    try {
      const raw = await firstValueFrom(
        this.http.get<ApiSubmission[]>(`${environment.apiUrl}/support`, { params }),
      );
      this._submissions.set(raw.map(mapSubmission));
    } catch (err) {
      this._error.set(extractApiError(err));
    } finally {
      this._isLoading.set(false);
    }
  }

  async submit(payload: CreateSubmissionPayload): Promise<Submission> {
    const raw = await firstValueFrom(
      this.http.post<ApiSubmission>(`${environment.apiUrl}/support`, payload),
    );
    const submission = mapSubmission(raw);
    this._submissions.update(existing => [submission, ...existing]);
    toast.success(this.translate.instant('SUPPORT.submit_success') as string);
    return submission;
  }

  async updateStatus(id: string, status: AdminStatus): Promise<Submission> {
    const raw = await firstValueFrom(
      this.http.patch<ApiSubmission>(`${environment.apiUrl}/support/${id}/status`, { status }),
    );
    const submission = mapSubmission(raw);
    this._submissions.update(list => list.map(s => (s.id === id ? submission : s)));
    toast.success(this.translate.instant('SUPPORT.status_updated') as string);
    return submission;
  }
}
