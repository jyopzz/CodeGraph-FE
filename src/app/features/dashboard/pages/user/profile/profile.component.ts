import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { takeUntil } from 'rxjs/operators';

import { ProfileService, ProfileDetails } from './services/profile.service';
import { BaseComponent } from '../../../../../core/base/base.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
  standalone: false,
})
export class ProfileComponent extends BaseComponent implements OnInit {
  override hostClass = 'app-profile-container';

  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private profileService = inject(ProfileService);

  profileForm!: FormGroup;
  isExistingProfile = false; // False = POST mode, True = PATCH mode
  isLoading = true;
  isSubmitting = false;

  readonly genderOptions = [
    { value: 'FEMALE', label: 'Female' },
    { value: 'MALE', label: 'Male' },
    { value: 'OTHER', label: 'Other' },
    { value: 'PREFER_NOT_TO_SAY', label: 'Prefer not to say' },
  ];

  ngOnInit(): void {
    this.initForm();
    this.fetchProfile();
  }

  private initForm(): void {
    this.profileForm = this.fb.group({
      displayName: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
        ],
      ],
      dateOfBirth: [null, [Validators.required]],
      gender: ['', [Validators.required]],
      location: ['', [Validators.required]],
      bio: ['', [Validators.maxLength(300)]],
    });
  }

  /** GET: Checks whether profile exists */
  fetchProfile(): void {
  this.isLoading = true;
  this.profileService.getProfile()
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (res) => {
        this.isLoading = false;

        // Unpack nested 'profile' object from data.profile
        const profileData = res?.data?.profile || res?.data || res;

        if (profileData && profileData.displayName) {
          this.isExistingProfile = true;

          // Convert 'YYYY-MM-DD' string to a local Date object without UTC shift
          let parsedDate: Date | null = null;
          if (profileData.dateOfBirth) {
            const [year, month, day] = profileData.dateOfBirth.split('-').map(Number);
            parsedDate = new Date(year, month - 1, day);
          }

          this.profileForm.patchValue({
            displayName: profileData.displayName,
            dateOfBirth: parsedDate,
            gender: profileData.gender,
            bio: profileData.bio ?? '',
            location: profileData.location
          });

          // Mark pristine so PATCH only detects actual user changes
          this.profileForm.markAsPristine();
        } else {
          this.isExistingProfile = false;
        }
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 404) {
          this.isExistingProfile = false;
        } else {
          this.snackBar.open('Failed to load profile', 'Dismiss', { duration: 3000 });
        }
      }
    });
}

  /** Submit: Routes dynamically to POST or PATCH */
  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    if (!this.isExistingProfile) {
      // POST: Send entire form payload
      const postPayload: ProfileDetails = {
        ...this.profileForm.value,
        dateOfBirth: this.formatDate(this.profileForm.value.dateOfBirth),
      };

      this.profileService
        .createProfile(postPayload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.isSubmitting = false;
            this.isExistingProfile = true;
            this.profileForm.markAsPristine();
            this.snackBar.open('Profile created successfully!', 'Close', {
              duration: 3000,
            });
          },
          error: (err) => {
            this.isSubmitting = false;
            this.snackBar.open(
              err?.error?.message || 'Failed to create profile',
              'Dismiss',
              { duration: 3000 },
            );
          },
        });
    } else {
      // PATCH: Send only modified (dirty) fields
      const dirtyFields = this.getDirtyValues(this.profileForm);

      if (Object.keys(dirtyFields).length === 0) {
        this.isSubmitting = false;
        this.snackBar.open('No changes detected to update.', 'Dismiss', {
          duration: 3000,
        });
        return;
      }

      if (dirtyFields['dateOfBirth']) {
        dirtyFields['dateOfBirth'] = this.formatDate(
          dirtyFields['dateOfBirth'],
        );
      }

      this.profileService
        .patchProfile(dirtyFields)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.isSubmitting = false;
            this.profileForm.markAsPristine();
            this.snackBar.open('Profile updated successfully!', 'Close', {
              duration: 3000,
            });
          },
          error: (err) => {
            this.isSubmitting = false;
            this.snackBar.open(
              err?.error?.message || 'Failed to update profile',
              'Dismiss',
              { duration: 3000 },
            );
          },
        });
    }
  }

  onReset(): void {
    this.profileForm.reset();
    this.fetchProfile();
  }

  private getDirtyValues(form: FormGroup): Record<string, any> {
    const dirtyValues: Record<string, any> = {};
    Object.keys(form.controls).forEach((key) => {
      const currentControl = form.controls[key];
      if (currentControl.dirty) {
        dirtyValues[key] = currentControl.value;
      }
    });
    return dirtyValues;
  }

  private formatDate(date: Date | string | null): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  }
}
