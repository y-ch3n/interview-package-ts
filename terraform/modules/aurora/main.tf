# ── Security Group ─────────────────────────────────────────────────────────────

resource "aws_security_group" "aurora" {
  name        = "school-admin-${var.environment}-aurora-sg"
  description = "Aurora MySQL cluster — allows MySQL inbound from EB instances only"
  vpc_id      = var.vpc_id

  ingress {
    description     = "MySQL from Elastic Beanstalk instances"
    from_port       = 3306
    to_port         = 3306
    protocol        = "tcp"
    security_groups = [var.eb_security_group_id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "school-admin-${var.environment}-aurora-sg"
  }
}

# ── Subnet Group ───────────────────────────────────────────────────────────────

resource "aws_db_subnet_group" "this" {
  name        = "school-admin-${var.environment}-aurora-subnet-group"
  description = "Aurora DB subnet group (private DB subnets)"
  subnet_ids  = var.db_subnet_ids

  tags = {
    Name = "school-admin-${var.environment}-aurora-subnet-group"
  }
}

# ── Parameter Group ────────────────────────────────────────────────────────────

resource "aws_rds_cluster_parameter_group" "this" {
  name        = "school-admin-${var.environment}-aurora-mysql8"
  family      = "aurora-mysql8.0"
  description = "Aurora MySQL 8.0 cluster parameter group"

  parameter {
    name  = "character_set_server"
    value = "utf8mb4"
  }

  parameter {
    name  = "collation_server"
    value = "utf8mb4_unicode_ci"
  }

  parameter {
    name  = "time_zone"
    value = "Asia/Singapore"
  }

  tags = {
    Name = "school-admin-${var.environment}-aurora-mysql8"
  }
}

# ── Aurora Cluster ─────────────────────────────────────────────────────────────

resource "aws_rds_cluster" "this" {
  cluster_identifier     = "school-admin-${var.environment}"
  engine                 = "aurora-mysql"
  engine_version         = "8.0.mysql_aurora.3.07.1"
  database_name          = var.db_name
  master_username        = var.db_master_username

  # AWS manages the master password and stores it in Secrets Manager automatically
  manage_master_user_password = true

  db_subnet_group_name            = aws_db_subnet_group.this.name
  vpc_security_group_ids          = [aws_security_group.aurora.id]
  db_cluster_parameter_group_name = aws_rds_cluster_parameter_group.this.name

  storage_encrypted   = true
  deletion_protection = var.deletion_protection

  skip_final_snapshot       = var.skip_final_snapshot
  final_snapshot_identifier = var.skip_final_snapshot ? null : "school-admin-${var.environment}-final-snapshot"

  backup_retention_period = 7
  preferred_backup_window = "02:00-03:00"

  enabled_cloudwatch_logs_exports = ["audit", "error", "slowquery"]

  tags = {
    Name = "school-admin-${var.environment}-aurora"
  }
}

# ── Cluster Instances ──────────────────────────────────────────────────────────

resource "aws_rds_cluster_instance" "writer" {
  identifier         = "school-admin-${var.environment}-writer"
  cluster_identifier = aws_rds_cluster.this.id
  instance_class     = var.instance_class
  engine             = aws_rds_cluster.this.engine
  engine_version     = aws_rds_cluster.this.engine_version

  db_subnet_group_name    = aws_db_subnet_group.this.name
  publicly_accessible     = false
  promotion_tier          = 0

  performance_insights_enabled = true

  tags = {
    Name = "school-admin-${var.environment}-writer"
    Role = "writer"
  }
}

resource "aws_rds_cluster_instance" "reader" {
  identifier         = "school-admin-${var.environment}-reader"
  cluster_identifier = aws_rds_cluster.this.id
  instance_class     = var.instance_class
  engine             = aws_rds_cluster.this.engine
  engine_version     = aws_rds_cluster.this.engine_version

  db_subnet_group_name    = aws_db_subnet_group.this.name
  publicly_accessible     = false
  promotion_tier          = 1

  performance_insights_enabled = true

  tags = {
    Name = "school-admin-${var.environment}-reader"
    Role = "reader"
  }
}
