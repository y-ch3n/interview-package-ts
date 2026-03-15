# IMPORTANT: Before running `terraform init`, you must create the S3 bucket and
# DynamoDB table manually (or via a bootstrap script), as Terraform cannot create
# its own backend resources.
#
# Bootstrap commands:
#   aws s3api create-bucket \
#     --bucket school-admin-tfstate-$(aws sts get-caller-identity --query Account --output text) \
#     --region ap-southeast-1 \
#     --create-bucket-configuration LocationConstraint=ap-southeast-1
#
#   aws s3api put-bucket-versioning \
#     --bucket school-admin-tfstate-$(aws sts get-caller-identity --query Account --output text) \
#     --versioning-configuration Status=Enabled
#
#   aws s3api put-bucket-encryption \
#     --bucket school-admin-tfstate-$(aws sts get-caller-identity --query Account --output text) \
#     --server-side-encryption-configuration '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]}'
#
#   aws dynamodb create-table \
#     --table-name school-admin-tfstate-lock \
#     --attribute-definitions AttributeName=LockID,AttributeType=S \
#     --key-schema AttributeName=LockID,KeyType=HASH \
#     --billing-mode PAY_PER_REQUEST \
#     --region ap-southeast-1
#
# Then replace <ACCOUNT_ID> below with your AWS account ID and run `terraform init`.

terraform {
  backend "s3" {
    bucket         = "school-admin-tfstate-<ACCOUNT_ID>"
    key            = "school-admin/terraform.tfstate"
    region         = "ap-southeast-1"
    dynamodb_table = "school-admin-tfstate-lock"
    encrypt        = true
  }
}
