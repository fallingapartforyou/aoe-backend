using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace aoe.Models;

public partial class AoeDbContext : DbContext
{
    public AoeDbContext()
    {
    }

    public AoeDbContext(DbContextOptions<AoeDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Answer> Answers { get; set; }

    public virtual DbSet<Assignment> Assignments { get; set; }

    public virtual DbSet<AssignmentClass> AssignmentClasses { get; set; }

    public virtual DbSet<Class> Classes { get; set; }

    public virtual DbSet<ClassStudent> ClassStudents { get; set; }

    public virtual DbSet<Question> Questions { get; set; }

    public virtual DbSet<QuestionOption> QuestionOptions { get; set; }

    public virtual DbSet<Submission> Submissions { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<Result> Results { get; set; }

    public virtual DbSet<StudentAnswer> StudentAnswers { get; set; }

    public DbSet<ClassJoinRequest> ClassJoinRequests { get; set; }

    public DbSet<Notification> Notifications { get; set; }

    public DbSet<ActivityLog> ActivityLogs { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Answer>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("answers_pkey");

            entity.HasOne(d => d.Question)
                .WithMany(p => p.Answers)
                .HasConstraintName("answers_question_id_fkey");

            entity.HasOne(d => d.Submission)
                .WithMany(p => p.Answers)
                .HasConstraintName("answers_submission_id_fkey");
        });

        modelBuilder.Entity<Assignment>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("assignments_pkey");

            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.Property(e => e.ShowExplanation)
                .HasDefaultValue(true);

            entity.Property(e => e.ShowResult)
                .HasDefaultValue(true);
        });

        modelBuilder.Entity<AssignmentClass>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("assignment_classes_pkey");

            entity.HasOne(d => d.Assignment)
                .WithMany(p => p.AssignmentClasses)
                .HasConstraintName("assignment_classes_assignment_id_fkey");

            entity.HasOne(d => d.Class)
                .WithMany(p => p.AssignmentClasses)
                .HasConstraintName("assignment_classes_class_id_fkey");
        });

        modelBuilder.Entity<Class>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("classes_pkey");

            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.HasOne(d => d.Teacher)
                .WithMany(p => p.Classes)
                .HasConstraintName("classes_teacher_id_fkey");
        });

        modelBuilder.Entity<ClassStudent>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("class_students_pkey");

            entity.HasOne(d => d.Class)
                .WithMany(p => p.ClassStudents)
                .HasConstraintName("class_students_class_id_fkey");

            entity.HasOne(d => d.Student)
                .WithMany(p => p.ClassStudents)
                .HasConstraintName("class_students_student_id_fkey");
        });

        modelBuilder.Entity<Question>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("questions_pkey");

            entity.HasOne(d => d.Assignment)
                .WithMany(p => p.Questions)
                .HasConstraintName("questions_assignment_id_fkey");
        });

        modelBuilder.Entity<QuestionOption>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("question_options_pkey");

            entity.HasOne(d => d.Question)
                .WithMany(p => p.QuestionOptions)
                .HasConstraintName("question_options_question_id_fkey");
        });

        modelBuilder.Entity<Submission>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("submissions_pkey");

            entity.Property(e => e.StartTime)
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.HasOne(d => d.Assignment)
                .WithMany(p => p.Submissions)
                .HasConstraintName("submissions_assignment_id_fkey");

            entity.HasOne(d => d.Student)
                .WithMany(p => p.Submissions)
                .HasConstraintName("submissions_student_id_fkey");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("users_pkey");

            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP");
        });

        modelBuilder.Entity<StudentAnswer>(entity =>
        {
            entity.ToTable("student_answers");

            entity.HasKey(e => new
            {
                e.StudentId,
                e.AssignmentId,
                e.QuestionId
            });

            entity.Property(e => e.StudentId)
                .HasColumnName("student_id");

            entity.Property(e => e.AssignmentId)
                .HasColumnName("assignment_id");

            entity.Property(e => e.QuestionId)
                .HasColumnName("question_id");

            entity.Property(e => e.ResultId)
                .HasColumnName("result_id");

            entity.Property(e => e.Answer)
                .HasColumnName("answer");

            entity.Property(e => e.IsCorrect)
                .HasColumnName("is_correct");

            entity.HasOne(e => e.Result)
                .WithMany(r => r.StudentAnswers)
                .HasForeignKey(e => e.ResultId)
                .HasPrincipalKey(r => r.Id)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Notification>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.Property(e => e.IsRead)
                .HasDefaultValue(false);

            entity.HasOne(d => d.User)
                .WithMany(p => p.Notifications)
                .HasForeignKey(d => d.UserId);
        });

        modelBuilder.Entity<ActivityLog>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.HasOne(d => d.User)
                .WithMany(p => p.ActivityLogs)
                .HasForeignKey(d => d.UserId);
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}