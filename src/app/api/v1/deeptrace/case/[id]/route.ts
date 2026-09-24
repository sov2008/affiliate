import { NextRequest, NextResponse } from 'next/server';
import { caseRepository } from '../../../../../../db/caseRepository';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
): Promise<NextResponse> {
  try {
    const resolvedParams = await Promise.resolve(context.params);
    const caseRef = decodeURIComponent(resolvedParams.id || '').trim();

    if (!caseRef) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_CASE_REF',
            message: 'Case reference parameter is required'
          }
        },
        { status: 400 }
      );
    }

    const caseRecord = caseRepository.getCaseRecord(caseRef);

    if (!caseRecord) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'CASE_NOT_FOUND',
            message: `Forensic case reference "${caseRef}" was not found in archive or has expired.`
          }
        },
        { status: 404 }
      );
    }

    // Increment views count for access telemetry
    try {
      caseRepository.incrementViews(caseRef);
    } catch (viewErr) {
      console.warn(`[Case API] Failed to increment views for ${caseRef}:`, viewErr);
    }

    const updatedViews = caseRecord.views_count + 1;

    return NextResponse.json(
      {
        success: true,
        caseReference: caseRecord.case_ref,
        viewsCount: updatedViews,
        createdAt: caseRecord.created_at,
        platform: caseRecord.platform,
        claimedLocation: caseRecord.claimed_location,
        report: caseRecord.report,
        data: caseRecord.report
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, max-age=60, s-maxage=300',
          'X-DeepTrace-Case-Ref': caseRef,
          'X-DeepTrace-Views': updatedViews.toString()
        }
      }
    );
  } catch (error: any) {
    console.error('[Case API] Internal error retrieving case:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while fetching the forensic case'
        }
      },
      { status: 500 }
    );
  }
}
